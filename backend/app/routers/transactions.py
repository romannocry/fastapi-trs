from typing import List, Optional, Any
from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, HTTPException, Body, Depends
from pymongo import errors
from pydantic.networks import EmailStr
from pydantic import ValidationError

from ..auth.auth import (
    get_hashed_password,
    get_current_active_superuser,
    get_current_active_user,
)
from .. import schemas, models

router = APIRouter()


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
    #ledger variables
    #    ledgerSchema = ledger.ledgerSchema
    #    ledgerAllowChange = ledger.allow_change
    #    ledgerAllowChangeUntilDate = ledger.allow_change_until_date
    #    ledgerAllowMultiple =ledger.allow_multiple

    # Try to find a transaction with same user & ledger
    
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
        return transaction
    except errors.DuplicateKeyError:
        raise HTTPException(
            status_code=400, detail="err."
        )