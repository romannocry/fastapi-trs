from typing import Optional, List
from beanie import PydanticObjectId
from pydantic import BaseModel, EmailStr, validator
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel as _BaseModel


class BaseModel(_BaseModel):
    class Config:
        @staticmethod
        def schema_extra(schema: dict, _):
            props = {}
            for k, v in schema.get('properties', {}).items():
                if not v.get("hidden", False):
                    props[k] = v
            schema["properties"] = props

# Shared properties
class TransactionBase(BaseModel):
    ledgerUUID: Optional[UUID] = None
    payload: Optional[dict] = None
    payload_hist: Optional[List[dict]] = None
    created_by: Optional[EmailStr] = None
    user_info: Optional[dict] = None

# Properties to receive via API on creation
class TransactionCreate(TransactionBase):
    ledgerUUID: UUID
    payload: dict
    user_info: dict

# Properties to receive via API on update
class TransactionUpdate(BaseModel):
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


