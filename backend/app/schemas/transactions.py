from typing import Optional
from beanie import PydanticObjectId
from pydantic import BaseModel, EmailStr, validator
from uuid import UUID
from datetime import datetime


# Shared properties
class TransactionBase(BaseModel):
    ledgerUUID: Optional[UUID] = None
    payload: Optional[dict] = None
    user_info: Optional[dict] = None

# Properties to receive via API on creation
class TransactionCreate(TransactionBase):
    ledgerUUID: UUID
    payload: dict
    user_info: dict

# Properties to receive via API on update
class TransactionUpdate(TransactionBase):
    payload: Optional[dict] = None


class TransactionInDBBase(TransactionBase):
    _id: Optional[PydanticObjectId] = None

    class Config:
        orm_mode = True


# Additional properties to return via API
class Transaction(TransactionInDBBase):
    uuid: UUID


# Additional properties stored in DB
class TransactionInDB(TransactionInDBBase):
    hashed_password: str


