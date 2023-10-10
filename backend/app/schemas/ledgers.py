from typing import Optional, List
from beanie import PydanticObjectId
from pydantic import BaseModel, EmailStr, validator, Field
from uuid import UUID
from datetime import datetime


# Shared properties
class LedgerBase(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    ledgerSchema: Optional[dict] = None
    allow_change: Optional[bool] = Field(default=False)
    allow_change_until_date: Optional[datetime] = None # ISO 8601 format
    allow_multiple: Optional[bool] = Field(default=False)
    triggers: Optional[List] = Field(default_factory=list)
    group: Optional[str] = None
    access_rights: Optional[List] = Field(default_factory=list)
    transaction_count: Optional[int] = None

# Properties to receive via API on creation
class LedgerCreate(LedgerBase):
    name: str
    description: str
    ledgerSchema: dict
    allow_multiple: bool = Field(default=False)
    allow_change: bool = Field(default=False)
    created_by: Optional[EmailStr] = None
    updated_by: Optional[EmailStr] = None
    triggers: Optional[List] = Field(default_factory=list)
    group: Optional[str] = None

# Properties to receive via API on update
class LedgerUpdate(LedgerBase):
    name: Optional[str] = None
    description: Optional[str] = None
    ledgerSchema: Optional[dict] = None
    allow_change: Optional[bool] = None
    allow_multiple: Optional[bool] = None
    triggers: Optional[List] = Field(default_factory=list)
    group: Optional[str] = None
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


