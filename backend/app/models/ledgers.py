from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, validator
from beanie import Document, Indexed
from datetime import datetime
from uuid import UUID, uuid4


class Ledger(Document):
    uuid: Indexed(UUID, unique=True) = Field(default_factory=uuid4)
    name: str
    description: str
    ledgerSchema: dict
    allow_change: Optional[bool] = False
    allow_change_until_date: Optional[datetime] = None # ISO 8601 format
    allow_multiple: Optional[bool] = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: EmailStr
    updated_by: EmailStr
    access_rights: List = Field(default=list)

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

    #class Config:
        #allow_mutation = False
        
    # If we leave date blank, considers that it is until the end.
    #@validator('allow_change_until_date', always=True)
    #def validate_allow_change_until_date(cls, value, values):
    #    if values.get('allow_change') is True and value is None:
    #        raise ValueError('allow_change_until_date is mandatory when allow_change is set to true')
    #    return value