from typing import List, Optional, Any
from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, HTTPException, Body, Depends, WebSocket, WebSocketDisconnect, BackgroundTasks
from pymongo import errors
from pydantic.networks import EmailStr
from pydantic import ValidationError
from fastapi.responses import JSONResponse
import random


from app.utils import email_notification
from app.utils.flatten_dict import *
from jsonschema import validate
from bson import json_util


import time
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
        for connection in self.active_connections:
            if connection.path_params['ledgerUUID'] == str(ledgerUUID):
                print(f"ready to broadcast data of {ledgerUUID}")
                await connection.send_text(str(message))

manager = ConnectionManager()


@router.get("", response_model=List[schemas.Transaction])
async def get_transactions_from_user(
    limit: Optional[int] = 100,
    offset: Optional[int] = 0,
    user_info: models.User = Depends(get_current_active_user),
    #admin_user: models.User = Depends(get_current_active_superuser),
):
    transactions = await models.Transaction.find({"created_by":user_info.email}).skip(offset).limit(limit).to_list()
    return transactions

@router.get("/{transactionUUID}", response_model=schemas.Transaction)
async def get_transaction_by_id(
    transactionUUID: UUID,
    limit: Optional[int] = 10,
    offset: Optional[int] = 0,
    user_info: models.User = Depends(get_current_active_user),
    #admin_user: models.User = Depends(get_current_active_superuser),
):

    transaction = await models.Transaction.find_one({
        "uuid": transactionUUID,
        })
    


    return transaction

@router.get("/ledger/{ledgerUUID}", response_model=List[schemas.Transaction])
async def get_transactions_from_ledger(
    background_tasks: BackgroundTasks,
    ledgerUUID: UUID,
    limit: Optional[int] = 10,
    offset: Optional[int] = 0,
    user_info: models.User = Depends(get_current_active_user),
    #admin_user: models.User = Depends(get_current_active_superuser),
):
    #background_tasks.add_task(email_notification.sending_email,"test1",str(user_info))


    #first we check that the ledger is accessible
    ledger = await models.Ledger.find_one({
        "uuid": ledgerUUID,
        "access_rights":{
          "$elemMatch": {  
              #"email":user_info.email,
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

@router.get("/ledger/me/{ledgerUUID}", response_model=List[schemas.Transaction])
async def get_transactions_from_current_user_and_ledger(
    background_tasks: BackgroundTasks,
    ledgerUUID: UUID,
    limit: Optional[int] = 10,
    offset: Optional[int] = 0,
    user_info: models.User = Depends(get_current_active_user),
    #admin_user: models.User = Depends(get_current_active_superuser),
):

    transactions = await models.Transaction.find({
        "ledgerUUID": ledgerUUID,
        "created_by":user_info.email
        }).skip(offset).limit(limit).to_list()
    


    return transactions

@router.post("")#, response_model=schemas.Transaction)
async def register_transaction(
    ledgerUUID: UUID = Body(...),
    payload: dict = Body(...),
    user_info: models.User = Depends(get_current_active_user)
):
    """
    Register a new transaction.
    """

    # Check if ledger exists:
    ledger = await models.Ledger.find_one({"uuid": ledgerUUID})
    if ledger is None:
        raise HTTPException(status_code=404, detail="Ledger not found")
    elif ledger.expiry_date < datetime.now(): 
        raise HTTPException(status_code=402, detail="Ledger expired!")
    else:
        validate_transaction(payload,ledger.ledgerSchema)
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
                        status_code=400, detail="transaction exists but could only be changed until "+str(ledger.allow_change_until_date)
                    ) 
            else:
                raise HTTPException(
                    status_code=400, detail="Changing is not allowed"
                )

@router.post("/{ledgerUUID}/{base64_payload}", response_model=schemas.Transaction)
async def register_transaction_encoded(
    background_tasks: BackgroundTasks,
    ledgerUUID: UUID,
    base64_payload: str,
    user_info: models.User = Depends(get_current_active_user)
):
    """
    Register a new transaction.
    """
    #randomNum = random.randrange(0, 5)
    #user_info = {
    #    'name':"roman",
    #    'email':f"{randomNum}roman.medioni@gmail.com"
    #}
    
    # Check if ledger exists:
    ledger = await models.Ledger.find_one({"uuid": ledgerUUID})
    if ledger is None:
        raise HTTPException(status_code=404, detail="Ledger not found")
    elif ledger.expiry_date is not None and ledger.expiry_date < datetime.now():
        raise HTTPException(status_code=402, detail=f"Ledger expired on {ledger.expiry_date.strftime('%d/%m/%Y')}")
    else: 
        try:
            payload = base64.b64decode(base64_payload)
            payload = json.loads(payload)
            print(type(payload))
        except Exception as e:
            raise HTTPException(status_code=400,detail=f'{e}')
        
        validate_transaction(payload,ledger.ledgerSchema)
   
        transaction = await models.Transaction.find_one({"ledgerUUID": ledgerUUID,"created_by":user_info.email})
        transactionCount = await models.Transaction.find({"ledgerUUID": ledgerUUID}).count()
        #if transactionCount >= ledger.max_transactions:
        #    raise HTTPException(status_code=402, detail=f"Input was capped at {ledger.max_transactions}")
        # if transaction does not exist
        #if ledger.max_transactions is None:
        if transaction is None or ledger.allow_multiple:
            print("no transactions exist - ok to persist")
            try:
                background_tasks.add_task(email_notification.sending_email,"new entry!","",str(ledger),str(user_info))
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
                transaction_json = json_util.dumps(convert_uuids(transaction.dict()))
                await manager.broadcast(transaction_json,transaction.ledgerUUID)
                await manager.broadcast(user_info.email,transaction.ledgerUUID)
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
                    #print("changing")
                    #background_tasks.add_task(email_notification.sending_email,"updated entry!","",str(ledger),str(user_info))
                    transaction.payload = payload
                    transaction.payload_hist.append({'payload':payload,'updated_at':datetime.now()})
                    #print(payload)
                    transaction.updated_at = datetime.now()
                    #try:
                    await transaction.save()
                    print("broadcasting")
                    # Convert to JSON using pymongo.json_util
                    transaction_json = json_util.dumps(convert_uuids(transaction.dict()))
                    #await manager.broadcast(flatten_dict(transaction_json),transaction.ledgerUUID)
                    #print(convert_uuids(transaction.dict()))
                    await manager.broadcast(transaction_json,transaction.ledgerUUID)

                    #return transaction
                    return JSONResponse(content={'updated':True}, status_code=200)

                    #except Exception as e: 
                    #    raise HTTPException(
                    #        status_code=400, detail=e
                    #    )
                else:
                    raise HTTPException(
                        status_code=400, detail=f"Input already exists and could only be changed until {ledger.allow_change_until_date.strftime('%d/%m/%Y')}"
                    ) 
            else:
                raise HTTPException(
                    status_code=400, detail="Your input has already been taken into account"
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
                status_code=400,detail=f'{e}'
            )


# Note that the verb is `websocket` here, not `get`, `post`, etc.
@router.websocket("/ws2/{ledgerUUID}")
async def websocket_endpoint2(websocket: WebSocket,ledgerUUID: UUID):#,user_info: models.User = Depends(get_current_active_user)):
    # Accept the connection from a client.
    print("connection accepted!!!")
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
                
            ledger = await models.Ledger.find_one({
                    "uuid": ledgerUUID,
                    "access_rights":{

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
                manager.active_connections.append({"ws":websocket,"user":'roman.medioni@gmail.com'})

            #await manager.broadcast(data)  # Broadcast the received data to all connected clients
    except WebSocketDisconnect:

        # Remove the WebSocket connection using list comprehension
        #ws_to_remove = [conn for conn in manager.active_connections if conn["ws"] == websocket]
        print(manager.active_connection)
        ws_to_remove = [index for index, conn in enumerate(manager.active_connections) if conn["ws"] == websocket]

        print(ws_to_remove[0])
        # Remove the WebSocket connection from the list of active connections
        #print(manager.active_connections)
        #print(ws_to_remove[0] in manager.active_connections)
        manager.active_connections.pop(ws_to_remove[0])


#private live feed
@router.websocket("/ws/{ledgerUUID}")
async def websocket_endpoint(websocket: WebSocket,ledgerUUID: UUID):#,user_info: models.User = Depends(get_current_active_user)):
    #await websocket.accept()   
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            #manager.broadcast(data)
            print('*****')
            print('***SOCKET**')
            print(data)
            if data != "token":
                print("no token received")
                await websocket.close(reason="You are not authorized to connect")
                break
            else:
                print("connected")
                #manager.active_connections.append({"ws":websocket,"user":'roman.medioni@gmail.com'})
                
            print('*****')
    except WebSocketDisconnect:
        # Handle disconnection, raise an error if needed
        print('*****')
        print(str(manager.active_connections))
        manager.disconnect(websocket)
        print(str(manager.active_connections))
        #await manager.broadcast(f"Client disconnect from {ledgerUUID}",ledgerUUID)
        print('*****')

#public live feed
@router.websocket("/live/{ledgerUUID}")
async def websocket_endpoint(websocket: WebSocket,ledgerUUID: UUID):#,user_info: models.User = Depends(get_current_active_user)):
    #await websocket.accept()   
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            #manager.broadcast(data)
            print('*****')
            print('***SOCKET**')
            print(data)
            if data != "token":
                print("no token received")
                await websocket.close(reason="You are not authorized to connect")
                break
            else:
                print("connected")
                #manager.active_connections.append({"ws":websocket,"user":'roman.medioni@gmail.com'})
                
            print('*****')
    except WebSocketDisconnect:
        # Handle disconnection, raise an error if needed
        print('*****')
        print(str(manager.active_connections))
        manager.disconnect(websocket)
        print(str(manager.active_connections))
        #await manager.broadcast(f"Client disconnect from {ledgerUUID}",ledgerUUID)
        print('*****')