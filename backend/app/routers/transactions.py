from typing import List, Optional, Any
from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, HTTPException, Body, Depends, WebSocket, WebSocketDisconnect
from pymongo import errors
from pydantic.networks import EmailStr
from pydantic import ValidationError

from jsonschema import validate

import asyncio
import logging
import base64
import json

from ..auth.auth import (
    get_hashed_password,
    get_current_active_superuser,
    get_current_active_user,
    get_current_user,
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

    async def broadcast(self, message: str, ledgerUUID: str):
        print("broadcast")
        for connection in self.active_connections:
            conn = connection.get('ws')
            #print(connection.get('ws'))
            #await connection.send_text(json.dumps(message.payload))
            #await connection.send_text(message)
            if conn.path_params['ledgerUUID'] == str(ledgerUUID):
                print("ready to broadcast")
                await conn.send_text(str(message))

manager = ConnectionManager()

@router.get("/{ledgerUUID}", response_model=List[schemas.Transaction])
async def get_transactions(
    ledgerUUID: UUID,
    limit: Optional[int] = 10,
    offset: Optional[int] = 0,
    user_info: models.User = Depends(get_current_active_user),
    #admin_user: models.User = Depends(get_current_active_superuser),
):

    #first we check that the ledger is accessible
    ledger = await models.Ledger.find_one({
        "uuid": ledgerUUID,
        "access_rights":{
          "$elemMatch": {  
              "email":user_info.email,
              #"profile":{ "$in": ["admin", "write","ee"] }
          }
        }
        })
    
    if ledger is None:
        raise HTTPException(status_code=404, detail="cannot get transactions since the ledger is not found or you do not have access to it")

    transactions = await models.Transaction.find({
        "ledgerUUID": ledgerUUID,
        }).skip(offset).limit(limit).to_list()
    return transactions

@router.post("")#, response_model=schemas.Transaction)
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
        print(user_info.get('email'))
        
        #if validate_transaction_payload:
        #    return validate_transaction_payload

        transaction = await models.Transaction.find_one({"ledgerUUID": ledgerUUID,"created_by":user_info.email})

        # if transaction does not exist
        if transaction is None or ledger.allow_multiple:
            print("no transactions exist - ok to persist")
            try:
                transaction = models.Transaction(
                    ledgerUUID=ledgerUUID,
                    payload=payload,
                    payload_hist=[payload],
                    user_info = user_info,
                    created_by=user_info.email
                )
                #print(payload)
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
                    print("changing")
                    transaction.payload = payload
                    transaction.payload_hist.append(payload)
                    #print(payload)
                    transaction.updated_at = datetime.now()
                    #try:
                    await transaction.save()
                    #print(transaction)
                    return transaction
                    #except Exception as e: 
                    #    raise HTTPException(
                    #        status_code=400, detail=e
                    #    )
                else:
                    raise HTTPException(
                        status_code=400, detail="transaction exists but cannot be changed anymore"
                    ) 
            else:
                raise HTTPException(
                    status_code=400, detail="Changing is not allowed"
                )

@router.post("/{ledgerUUID}/{base64_payload}")#, response_model=schemas.Transaction)
async def register_transaction_encoded(
    ledgerUUID: UUID,
    base64_payload: str,
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
        try:
            print(base64_payload)
            payload = base64.b64decode(base64_payload)
            print(payload)
            print(type(payload))
            payload = json.loads(payload)
            print(type(payload))
        except Exception as e:
            raise HTTPException(status_code=400,detail="AH!"+str(e))
        
        validate_transaction(payload,ledger.ledgerSchema)
        print(user_info.get('email'))
        
        #if validate_transaction_payload:
        #    return validate_transaction_payload

        transaction = await models.Transaction.find_one({"ledgerUUID": ledgerUUID,"created_by":user_info.email})

        # if transaction does not exist
        if transaction is None or ledger.allow_multiple:
            print("no transactions exist - ok to persist")
            try:
                transaction = models.Transaction(
                    ledgerUUID=ledgerUUID,
                    payload=payload,
                    payload_hist=[payload],
                    user_info = user_info,
                    created_by=user_info.email
                )
                #print(payload)
            except ValidationError as e:
                print(e.errors())
                raise HTTPException(
                    status_code=400, detail=e.errors()
                ) 
            
            try:
                await transaction.create()
                await manager.broadcast(transaction,transaction.ledgerUUID)
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
                    print("changing")
                    transaction.payload = payload
                    transaction.payload_hist.append(payload)
                    #print(payload)
                    transaction.updated_at = datetime.now()
                    #try:
                    await transaction.save()
                    await manager.broadcast(transaction,transaction.ledgerUUID)
                    return transaction
                    #except Exception as e: 
                    #    raise HTTPException(
                    #        status_code=400, detail=e
                    #    )
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
    try:
        transaction = await models.Transaction.find_one({"uuid": transactionid})
        if transaction is None:
            print("transaction not found")
            raise HTTPException(
                status_code=400, detail="transaction does not exist"
            )
        else:
            ledger = await models.Ledger.find_one({"uuid": transaction.ledgerUUID})
            validate_transaction(update.payload,ledger.ledgerSchema)
            transaction = transaction.copy(update=update.dict(exclude_unset=True))
            transaction.payload_hist.append(update.payload)
    except Exception as e: 
        raise HTTPException(
            status_code=400, detail="error"
        )
            
    try:
        await transaction.save()
        await manager.broadcast(transaction,transaction.ledgerUUID)
        return transaction
    except errors.DuplicateKeyError:
        raise HTTPException(
            status_code=400, detail="err."
        )


def validate_transaction(transaction_payload,ledger_schema):
        try:
            payload = transaction_payload
            validate(instance=transaction_payload,schema=ledger_schema)
            return True
        except Exception as e:
            raise HTTPException(
                status_code=400,detail="OH!"+str(e)
            )


# Note that the verb is `websocket` here, not `get`, `post`, etc.
@router.websocket("/ws/{ledgerUUID}")
async def websocket_endpoint(websocket: WebSocket,ledgerUUID: UUID):#,user_info: models.User = Depends(get_current_active_user)):
    # Accept the connection from a client.
    await websocket.accept()
    
    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            print(payload['token'])
            #print(type(data))
            #print(json.loads(data))
            authenticated = await get_current_user(payload['token'])
            if authenticated is None:
                print("authentication to the websocket failed")
            else:
                print("autentication succeeded")
                # check if the user has access to the actual ledger
                ledger = await models.Ledger.find_one({
                    "uuid": ledgerUUID,
                    "access_rights":{
                    "$elemMatch": {  
                        "email":authenticated.email,
                    }
                    }
                    })
                if ledger is None:
                    print("access rights not enough")
                    await websocket.send_text(json.dumps({"status_code:":403,"detail":"Credentials too low"}))
                    #raise HTTPException(status_code=403, detail="Connection denied")
                    #raise HTTPException(status_code=404, detail="ledger not found or you do not have access to the ledger")
                else:
                    # Add the WebSocket connection to the list of active connections
                    print("access rights ok")
                    manager.active_connections.append({"ws":websocket,"user":authenticated.email})

            #await manager.broadcast(data)  # Broadcast the received data to all connected clients
    except WebSocketDisconnect:

        # Remove the WebSocket connection using list comprehension
        #ws_to_remove = [conn for conn in manager.active_connections if conn["ws"] == websocket]
        ws_to_remove = [index for index, conn in enumerate(manager.active_connections) if conn["ws"] == websocket]

        print(ws_to_remove[0])
        # Remove the WebSocket connection from the list of active connections
        #print(manager.active_connections)
        #print(ws_to_remove[0] in manager.active_connections)
        manager.active_connections.pop(ws_to_remove[0])








