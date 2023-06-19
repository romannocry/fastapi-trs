from typing import Optional
from beanie import PydanticObjectId
from pydantic import BaseModel, EmailStr, validator, Field
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
    
    @validator('allow_change')
    def allow_change_xor_multiple(cls, v, values):
        print('allow_change_validator')
        if v and values.get('allow_mutiple', False):
            raise ValueError('allow_change and allow_mutiple cannot both be true')
        return v

    @validator('allow_multiple')
    def allow_multiple_wor_change(cls, v, values):
        print('allow_multiple_validator')
        if v and values.get('allow_change', False):
            raise ValueError('allow_mutiple and allow_change cannot both be true')
        return v
# Properties to receive via API on creation
class LedgerCreate(LedgerBase):
    name: str
    description: str
    ledgerSchema: dict
    allow_multiple: bool
    created_by: Optional[EmailStr] = None
    updated_by: Optional[EmailStr] = None

# Properties to receive via API on update
class LedgerUpdate(LedgerBase):
    name: Optional[str] = None
    description: Optional[str] = None
    ledgerSchema: Optional[dict] = None
    allow_change: Optional[bool] = False
    #created_by: EmailStr = Field(..., editable=False, exclude=True)

    
class LedgerInDBBase(LedgerBase):
    _id: Optional[PydanticObjectId] = None

    class Config:
        orm_mode = True,



# Additional properties to return via API
class Ledger(LedgerInDBBase):
    uuid: UUID


# Additional properties stored in DB
class LedgerInDB(LedgerInDBBase):
    hashed_password: str


