from typing import Optional
from beanie import PydanticObjectId
from pydantic import BaseModel, EmailStr, validator
from uuid import UUID
from datetime import datetime


# Shared properties
class LedgerBase(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    ledgerSchema: Optional[dict] = None
    allow_change: Optional[bool] = False
    allow_change_until_date: Optional[datetime] = None # ISO 8601 format
    allow_multiple: Optional[bool] = False

# Properties to receive via API on creation
class LedgerCreate(LedgerBase):
    name: str
    description: str
    ledgerSchema: dict
    allow_multiple: bool

# Properties to receive via API on update
class LedgerUpdate(LedgerBase):
    password: Optional[str] = None


class LedgerInDBBase(LedgerBase):
    _id: Optional[PydanticObjectId] = None

    class Config:
        orm_mode = True


# Additional properties to return via API
class Ledger(LedgerInDBBase):
    uuid: UUID


# Additional properties stored in DB
class LedgerInDB(LedgerInDBBase):
    hashed_password: str


