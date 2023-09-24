from typing import List, Optional, Any
from uuid import UUID

from fastapi import APIRouter, HTTPException, Body, Depends
from pymongo import errors
from pydantic.networks import EmailStr

from ..auth.auth import (
    get_hashed_password,
    get_current_active_superuser,
    get_current_active_user,
)
from .. import schemas, models

router = APIRouter()


@router.post("",response_model=schemas.TestParent)
async def register_test(
    #limit: Optional[int] = 10,
    #email: EmailStr = Body(...)
    email: EmailStr = Body(...),
    first_name: str = Body(None),
    last_name: str = Body(None),
):
    """
    Register a new test.
    """
    test = models.TestParent(
        email=email,
        first_name=first_name,
        last_name=last_name,
    )
    try:
        await test.create()
        return test
    except errors.DuplicateKeyError:
        raise HTTPException(
            status_code=400, detail="User with that email already exists."
        )