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
#ledger types:
    #form generation - basic
    #url redirect -- isn t it a trigger??
    #

@router.post("", response_model=schemas.LedgerCreate)
async def register_ledger(
    name: str = Body(...),
    description: str = Body(...),
    ledgerSchema: dict = Body(...),
    group: str = Body('My Ledgers'),
    allow_change: bool = Body(True),
    allow_change_until_date: datetime = Body(None),
    allow_multiple: bool = Body(False),
    user_info: models.User = Depends(get_current_active_user)

):
    """
    Register a new ledger.
    """
    try:
        ledger = models.Ledger(
            name=name,
            description=description,
            ledgerSchema=ledgerSchema,
            group=group,
            allow_change=allow_change,
            allow_change_until_date=allow_change_until_date,
            allow_multiple=allow_multiple,
            created_by=user_info.email,
            updated_by=user_info.email,
            access_rights=[{"email":user_info.email,"profile":"admin"}],
            triggers = []
        )
    except ValidationError as e:
        raise HTTPException(
            status_code=400, detail=str(e)
        ) 
    
    try:
        await ledger.create()
        return ledger
    #except errors.DuplicateKeyError:
    except Exception as e: 
        raise HTTPException(
            status_code=400, detail=str(e)
        )


@router.get("", response_model=List[schemas.Ledger])
async def get_ledgers(
    limit: Optional[int] = 10,
    offset: Optional[int] = 0,
    user_info: models.User = Depends(get_current_active_user),
    #admin_user: models.User = Depends(get_current_active_superuser),
):

    ledgers = await models.Ledger.find({
        "access_rights":{
          "$elemMatch": {  
              "email":user_info.email
          }
        }

        }).skip(offset).limit(limit).to_list()

    return ledgers


@router.get("/{ledgerid}", response_model=schemas.Ledger)
async def get_ledger(
    ledgerid: UUID, 
    user_info: models.User = Depends(get_current_active_user)
):
    """
    Get Ledger Info

    Parameters
    ----------
    ledgerid : UUID
        the ledger's UUID

    Returns
    -------
    schemas.Ledger
        Ledger info
    """
    ledger = await models.Ledger.find_one({
        "uuid": ledgerid,
        "access_rights":{
          "$elemMatch": {  
              #"email":user_info.email,
              #"profile":{ "$in": ["admin", "write","ee"] }
          }
        }
        })

    if ledger is None:
        raise HTTPException(status_code=401, detail="ledger not found or you do not have access to the ledger")

    # Calculate transaction count
    await ledger.calculate_transaction_count()
    
    return ledger


@router.patch("/{ledgerid}", response_model=schemas.Ledger)
async def update_ledger(
    ledgerid: UUID,
    update: schemas.LedgerUpdate,
    user_info: models.User = Depends(get_current_active_user),
) -> Any:
    """
    Update a ledger.

    ** Restricted to admin & write profiles **

    Parameters
    ----------
    ledgerid : UUID
        the ledgerid's UUID
    update : schemas.LedgerUpdate
        the update data
    current_user : models.User, optional
        the current superuser, by default Depends(get_current_active_superuser)
    """
    ledger = await models.Ledger.find_one({
        "uuid": ledgerid,
        "access_rights":{
          "$elemMatch": {  
              "email":user_info.email,
              "profile":{ "$in": ["admin", "write"] }
          }
        }
        })
    if ledger is None:
        raise HTTPException(status_code=404, detail="ledger not found or you do not have sufficient access to the ledger to patch")
    
    # Perform constraint check
    if update.allow_change == update.allow_multiple == True:
        raise HTTPException(status_code=400, detail="allow_change and allow_multiple cannot be both True")
    elif update.allow_change == ledger.allow_multiple == True and update.allow_multiple is None:
        raise HTTPException(status_code=400, detail="allow_change and allow_multiple cannot be both True")
    elif update.allow_multiple == ledger.allow_change == True and update.allow_change is None:
        raise HTTPException(status_code=400, detail="allow_change and allow_multiple cannot be both True")

    #if update.password is not None:
    #    update.password = get_hashed_password(update.password)
    ledger = ledger.copy(update=update.dict(exclude_unset=True))
    ledger.updated_at = datetime.now()
    #print("ledger")
    #print(ledger)
    #print("ledger update")
    #print(update)

    try:
        await ledger.save()
        return ledger
    except Exception as e: 
            raise HTTPException(
                status_code=400, detail=str(e)
            )