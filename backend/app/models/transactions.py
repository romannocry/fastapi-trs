from typing import Optional
from pydantic import BaseModel, EmailStr, Field, validator
from beanie import Document, Indexed
from datetime import datetime
from uuid import UUID, uuid4


class Transaction(Document):
    uuid: Indexed(UUID, unique=True) = Field(default_factory=uuid4)
    ledgerUUID: UUID
    payload: dict
    user_info: dict 
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
