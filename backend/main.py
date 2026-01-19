from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from uuid import uuid4
from datetime import datetime, timezone

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # CRA dev server
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory database
rooms = ["Room A", "Room B", "Room C"]
bookings = {}  # {room_name: [{start, end, code}]}

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

@app.get("/rooms", response_model=List[str])
def get_rooms():
    return rooms

@app.get("/bookings/{room}", response_model=List[BookingResponse])
def get_room_bookings(room: str):
    return bookings.get(room, [])

@app.post("/book", response_model=BookingResponse)
def create_booking(booking: BookingRequest):
    if booking.room not in rooms:
        raise HTTPException(status_code=404, detail="Room not found")

    if booking.start >= booking.end:
        raise HTTPException(
            status_code=400,
            detail="Start time must be before end time",
        )

    now = datetime.now(timezone.utc)
    start = booking.start
    end = booking.end

    if start.tzinfo is None:
        start = start.replace(tzinfo=timezone.utc)
    if end.tzinfo is None:
        end = end.replace(tzinfo=timezone.utc)

    if start < now:
        raise HTTPException(
            status_code=400,
            detail="Cannot book a time that has already passed",
        )

    room_bookings = bookings.get(booking.room, [])

    for b in room_bookings:
        existing_start = b["start"]
        existing_end = b["end"]

        if existing_start.tzinfo is None:
            existing_start = existing_start.replace(tzinfo=timezone.utc)
        if existing_end.tzinfo is None:
            existing_end = existing_end.replace(tzinfo=timezone.utc)

        if not (end <= existing_start or start >= existing_end):
            raise HTTPException(
                status_code=400,
                detail="Room is already booked for that time slot",
            )

    code = str(uuid4())
    new_booking = {
        "room": booking.room,
        "start": start,
        "end": end,
        "code": code,
    }

    room_bookings.append(new_booking)
    bookings[booking.room] = room_bookings
    return new_booking

@app.delete("/cancel/{room}/{code}")
def cancel_booking(room: str, code: str):
    room_bookings = bookings.get(room, [])
    for b in room_bookings:
        if b["code"] == code:
            room_bookings.remove(b)
            bookings[room] = room_bookings
            return {"detail": "Booking cancelled"}
    raise HTTPException(status_code=403, detail="Invalid cancellation code")
