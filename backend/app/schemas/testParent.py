from typing import Optional
from beanie import PydanticObjectId, Indexed
from pydantic import BaseModel, EmailStr, Field
from uuid import UUID, uuid4
from .users import *


# Shared properties
class TestParent(BaseModel):
    email: Optional[EmailStr] = None
    #first_name: Optional[str] = None
    #last_name: Optional[str] = None


# Properties to receive via API on creation
class TestParentCreate(TestParent):
    uuid: Indexed(UUID, unique=True) = Field(default_factory=uuid4)
    email: EmailStr
    first_name: str
    last_name:str

