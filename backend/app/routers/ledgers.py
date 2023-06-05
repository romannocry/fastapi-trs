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


@router.post("", response_model=schemas.Ledger)
async def register_ledger(
    name: str = Body(...),
    description: str = Body(...),
    ledgerSchema: dict = Body(...),
    allow_change: bool = Body(...),
    allow_change_until_date: datetime = Body(None),
    allow_multiple: bool = Body(...),
    #current_user: models.User = Depends(get_current_active_user)

):
    """
    Register a new ledger.
    """
    try:
        ledger = models.Ledger(
            name=name,
            description=description,
            ledgerSchema=ledgerSchema,
            allow_change=allow_change,
            allow_change_until_date=allow_change_until_date,
            allow_multiple=allow_multiple,
        )
    except ValidationError as e:
        print(e.errors())
        raise HTTPException(
            status_code=400, detail=e.errors()
        ) 
    
    try:
        await ledger.create()
        return ledger
    #except errors.DuplicateKeyError:
    except Exception as e: 
        raise HTTPException(
            status_code=400, detail=e
        )
