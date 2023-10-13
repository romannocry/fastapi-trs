from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, validator, Extra
from beanie import Document, Indexed
from datetime import datetime, timedelta
from uuid import UUID, uuid4
from pytz import timezone
from .transactions import Transaction
import pytz

# Define the Eastern Time zone

# Custom default factory function to get the current time in Eastern Time
# does not work as mongo is saving all the dates in UTC
def get_current_time_eastern():
    # giving the timezone to which it is to be converted
    eastern = pytz.timezone('Asia/Kolkata')
    # Getting the current time in EST Time Zone
    datetime_object = datetime.now(eastern)
    print(datetime_object)
    return datetime_object

class Ledger(Document):
    uuid: Indexed(UUID, unique=True) = Field(default_factory=uuid4)
    name: str
    description: str
    ledgerSchema: dict
    allow_change: Optional[bool] = Field(default=False)
    allow_change_until_date: Optional[datetime] = None # ISO 8601 format
    expiry_date: Optional[datetime] = None # ISO 8601 format
    allow_multiple: Optional[bool] = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: EmailStr
    updated_by: EmailStr
    access_rights: List = Field(default=list)
    #triggers are objects that holds actions/triggers when the transactions is processed
    #some triggers comes out of the box (send an email, trigger a workflow)
    triggers: Optional[List] = Field(default=list)
    #group: in order to open ledgers that are linked to each other
    group: Optional[str] = None
    quizMode: Optional[bool] = Field(default=False)
    transaction_count: Optional[int] = None
    max_transactions: Optional[int] = None
    
    
    #@property
    #async def transaction_count(self):
    #    return await Transaction.collection.count_documents({"ledgerUUID": self.uuid})

    async def calculate_transaction_count(self):
            self.transaction_count = await Transaction.find({"ledgerUUID": self.uuid}).count()

    @validator('allow_change', always=True)
    def allow_change_xor_multiple(cls, v, values):
        print('allow_change_validator')
        if v and values.get('allow_mutiple', False):
            raise ValueError('allow_change and allow_mutiple cannot both be true')
        return v

    @validator('allow_multiple', always=True)
    def allow_multiple_xor_change(cls, v, values):
        print('allow_multiple_validator')
        if v and values.get('allow_change', False):
            raise ValueError('allow_mutiple and allow_change cannot both be true')
        return v


 
    #class Config:
        #allow_mutation = False
    #    extra = Extra.allow

    # If we leave date blank, considers that it is until the end.
    #@validator('allow_change_until_date', always=True)
    #def validate_allow_change_until_date(cls, value, values):
    #    if values.get('allow_change') is True and value is None:
    #        raise ValueError('allow_change_until_date is mandatory when allow_change is set to true')
    #    return value