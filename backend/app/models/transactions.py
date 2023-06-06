from typing import Optional
from pydantic import BaseModel, EmailStr, Field, validator
from beanie import Document, Indexed
from datetime import datetime
from uuid import UUID, uuid4
from .. import schemas, models

class Transaction(Document):
    uuid: Indexed(UUID, unique=True) = Field(default_factory=uuid4)
    ledgerUUID: UUID
    payload: dict
    user_info: dict 
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
"""
    @validator('payload')
    def validate_payload(cls, v, values):
        print('validate_payload')
        #print(v)
        #print(values)
        ledger = get_ledger_schema_from_db(values.get('ledgerUUID'))

def get_ledger_schema_from_db(ledgerid):
    # Access the MongoDB database and retrieve the attribute
    # For example:
    ledger = models.Ledger.find_one({"uuid": ledgerid})
    if ledger is None:
        return "ledger not found"

    return ledger
"""