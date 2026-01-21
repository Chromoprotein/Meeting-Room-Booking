from pydantic import BaseModel
from datetime import datetime

# Pydantic models
class BookingRequest(BaseModel):
    room: str
    start: datetime
    end: datetime

class BookingResponse(BaseModel):
    room: str
    start: datetime
    end: datetime
    code: str

class CancelResponse(BaseModel):
    room: str
    start: datetime
    end: datetime