from typing import List, Optional, Any
from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, HTTPException, Body, Depends, WebSocket, WebSocketDisconnect
from pymongo import errors
from pydantic.networks import EmailStr
from pydantic import ValidationError

import asyncio
import logging
import base64
import json

from ..auth.auth import (
    get_hashed_password,
    get_current_active_superuser,
    get_current_active_user,
)
from .. import schemas, models

router = APIRouter()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("FastAPI app")

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str, ledgerId: str):
        print("broadcast")
        for connection in self.active_connections:
            print(message)
            print(type(message))
            await connection.send_text(json.dumps(message.payload))
            #await connection.send_text(message)
            #if connection.path_params['ledgerId'] == ledgerId:
            #    await connection.send_text(message)

manager = ConnectionManager()

@router.post("", response_model=schemas.Transaction)
async def register_transaction(
    ledgerUUID: UUID = Body(...),
    payload: dict = Body(...),
    #user_info: dict = Body(...),
    user_info: models.User = Depends(get_current_active_user)
):
    """
    Register a new transaction.
    """

    # Check if ledger exists:
    ledger = await models.Ledger.find_one({"uuid": ledgerUUID})
    if ledger is None:
        raise HTTPException(status_code=404, detail="Ledger not found")
    else: 
        validate_transaction(payload,ledger.ledgerSchema)
        #if validate_transaction_payload:
        #    return validate_transaction_payload
        transaction = await models.Transaction.find_one({"ledgerUUID": ledgerUUID,"user_info.email":user_info.email})

        # if transaction does not exist
        if transaction is None or ledger.allow_multiple:
            print("no transactions exist - ok to persist")
            try:
                transaction = models.Transaction(
                    ledgerUUID=ledgerUUID,
                    payload=payload,
                    user_info={"email":user_info.email},
                )
            except ValidationError as e:
                print(e.errors())
                raise HTTPException(
                    status_code=400, detail=e.errors()
                ) 
            
            try:
                await transaction.create()
                return transaction
            #except errors.DuplicateKeyError:
            except Exception as e: 
                raise HTTPException(
                    status_code=400, detail=e
                )
        else:
            # allow change?
            print("going else")
            if ledger.allow_change:
                # if yes, if the date is empty or after the current datetime, we can persist the change
                if ledger.allow_change_until_date is None or ledger.allow_change_until_date > datetime.now():
                    transaction.payload = payload
                    transaction.updated_at = datetime.now()
                    try:
                        await transaction.save()
                        return transaction
                    except Exception as e: 
                        raise HTTPException(
                            status_code=400, detail=e
                        )
                else:
                    raise HTTPException(
                        status_code=400, detail="transaction exists but cannot be changed anymore"
                    ) 
            else:
                raise HTTPException(
                    status_code=400, detail="Changing is not allowed"
                ) 


@router.patch("/{transactionid}", response_model=schemas.Transaction)
async def update_transaction(
    transactionid: UUID,
    update: schemas.TransactionUpdate,
) -> Any:
    """
    Update a transaction.

    Parameters
    ----------
    userid : UUID
        the transaction's UUID
    update : schemas.transactionUpdate
        the update data

    """
    transaction = await models.Transaction.find_one({"uuid": transactionid})
    transaction = transaction.copy(update=update.dict(exclude_unset=True))

    try:
        await transaction.save()
        await manager.broadcast(transaction,transaction.ledgerUUID)
        return transaction
    except errors.DuplicateKeyError:
        raise HTTPException(
            status_code=400, detail="err."
        )


def validate_transaction(transaction_payload, ledger_payload):
    #print(transaction_payload)
    #print(ledger_payload)
    #print(ledger_payload['required'])

    #to activate for the UI
    #try:    
    #    transaction_payload_base64_decode = base64.b64decode(transaction_payload)
    #    transaction_payload_to_dict = json.loads(transaction_payload_base64_decode)
    #except Exception as e: 
    #    raise HTTPException(
    #        status_code=422, detail="payload is not valid"
    #    )
    
    payload = {}
    for k,v in ledger_payload['properties'].items():
        print(k, '->', v)
        #if key exists in the payload - check that the value is authorized
        print(k in transaction_payload.keys())
        if k in transaction_payload.keys():
            #if the model attribute is a list, use "in"
            if 'enum' in v.keys() and (isinstance(transaction_payload[k],int) or isinstance(transaction_payload[k],str)):
                print("is enum")
                if transaction_payload[k] in v['enum'] or not v['enum']:
                    print("payload "+ str(transaction_payload[k]) + " authorized in model")
                    payload[k] = transaction_payload[k]
                else: 
                    print("payload "+ str(transaction_payload[k]) + " NOT authorized in model, values expected in: "+str(v['enum'])+", value received:"+str(transaction_payload[k])+" of type:"+str(type(transaction_payload[k])))
                    raise HTTPException(status_code=400, detail="invalid payload, values expected in: "+str(v['enum'])+", value received:"+str(transaction_payload[k])+" of type:"+str(type(transaction_payload[k])))
           #if not a list, then it is an open type *integer* *datetime*
            elif 'items' in v.keys():
                print("is multi item")
                data = []
                for item in transaction_payload[k]:
                    lookup = any(x['const'] == item for x in v['items']['oneOf'])
                    if lookup:
                        print("payload "+ str(item)+" authorized in model")
                        data.append(item)
                    else:
                        print("payload "+ str(item) + " NOT authorized in model, values expected in: "+str(v['items']['oneOf'])+", value received:"+str(item)+" of type:"+str(type(item)))
                        raise HTTPException(status_code=400, detail="invalid payload, values expected in: "+str(v['items']['oneOf'])+", value received:"+str(item)+" of type:"+str(type(item)))
                payload[k] = data
            else:
                print("is not enum")
                if isinstance(transaction_payload[k],eval(v['type'][0:3])):
                    print("payload "+ str(transaction_payload[k]) + " authorized in model")
                    payload[k] = transaction_payload[k]    
                else: 
                    print("payload "+ str(transaction_payload[k]) + " NOT authorized in model, type expected: "+str(v['type'])+", type received:"+str(type(payloadModel[k])))
                    raise HTTPException(status_code=400, detail="invalid payload, type expected:"+str(v['type'])+", type received:"+str(type(payloadModel[k])))
            ## NEED TO HANDLE MULTI ENUM ##
        else: #k in required_keys:
            if (k in ledger_payload['required']):
            #should be able to push a subset of the data
                print("no data was pushed for required key '"+k+"'. Please review your payload")
                raise HTTPException(status_code=400, detail="missing value for required field: '"+str(k)+"' of type "+str(v['type']))
            else:
                print("no data was pushed for key '"+k+"' but it was not mandatory")

    return None


# Note that the verb is `websocket` here, not `get`, `post`, etc.
@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    # Accept the connection from a client.
    await websocket.accept()
    
    # Add the WebSocket connection to the list of active connections
    manager.active_connections.append(websocket)
    
    try:
        while True:
            data = await websocket.receive_text()
            #await manager.broadcast(data)  # Broadcast the received data to all connected clients
    except WebSocketDisconnect:
        # Remove the WebSocket connection from the list of active connections
        manager.active_connections.remove(websocket)