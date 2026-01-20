from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from uuid import uuid4
from datetime import date, datetime, timezone

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
def get_room_bookings(
    room: str,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
):
    room_bookings = bookings.get(room, [])

    if start_date and end_date:
        room_bookings = [
            b for b in room_bookings
            if start_date <= b["start"].date() <= end_date
        ]

    return room_bookings

@app.post("/book", response_model=BookingResponse)
def create_booking(booking: BookingRequest):

    start = booking.start
    end = booking.end

    # Check that the room exists
    if booking.room not in rooms:
        raise HTTPException(status_code=404, detail="Room not found")

    # Prevent too long bookings
    MAX_DURATION_HOURS = 3  # maximum allowed booking length
    duration = (end - start).total_seconds() / 3600
    if duration <= 0:
        raise HTTPException(status_code=400, detail="Start time must be before end time")

    if duration > MAX_DURATION_HOURS:
        raise HTTPException(
            status_code=400,
            detail=f"Booking cannot be longer than {MAX_DURATION_HOURS} hours"
        )

    # Prevent start time from being before end time
    if start >= end:
        raise HTTPException(
            status_code=400,
            detail="Start time must be before end time",
        )

    # Prevent bookings from the past
    now = datetime.now(timezone.utc)

    if start.tzinfo is None:
        start = start.replace(tzinfo=timezone.utc)
    if end.tzinfo is None:
        end = end.replace(tzinfo=timezone.utc)

    if start < now:
        raise HTTPException(
            status_code=400,
            detail="Cannot book a time that has already passed",
        )

    # Only allow start times on the hour
    if start.minute != 0 or start.second != 0 or start.microsecond != 0:
        raise HTTPException(
            status_code=400,
            detail="Start time must be at the beginning of the hour"
        )

    # Only allow bookings in the current year
    if start.year != now.year or end.year != now.year:
        raise HTTPException(
            status_code=400,
            detail=f"Bookings must be within the current year ({now.year})"
        )

    # Prevent double booking
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

    # Book the room
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

@app.delete("/bookings/cancel/{code}")
def cancel_booking(code: str):
    for room, room_bookings in bookings.items():
        for booking in room_bookings:
            if booking["code"] == code:
                room_bookings.remove(booking)
                return {
                    "message": "Booking cancelled",
                    "room": booking["room"],
                    "start": booking["start"],
                    "end": booking["end"],
                }

    raise HTTPException(status_code=404, detail="Invalid cancellation code")
