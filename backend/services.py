from datetime import datetime, timezone
from fastapi import HTTPException
from uuid import uuid4
from storage import rooms, bookings

MAX_DURATION_HOURS = 3  # maximum allowed booking length

def create_booking_service(room: str, start: datetime, end: datetime):

    # Check that the room exists
    if room not in rooms:
        raise HTTPException(status_code=404, detail="Room not found")
    
    # Prevent start time from being after end time
    duration = (end - start).total_seconds() / 3600
    if duration <= 0:
        raise HTTPException(status_code=400, detail="Start time must be before end time")

    #Prevent too long bookings
    if duration > MAX_DURATION_HOURS:
        raise HTTPException(
            status_code=400,
            detail=f"Booking cannot be longer than {MAX_DURATION_HOURS} hours"
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
    room_bookings = bookings.get(room, [])
    for b in room_bookings:
        if not (end <= b["start"] or start >= b["end"]):
            raise HTTPException(
                status_code=400,
                detail="Room is already booked for that time slot",
            )
        
    # Book the room
    code = str(uuid4())
    new_booking = {
        "room": room,
        "start": start,
        "end": end,
        "code": code,
    }

    room_bookings.append(new_booking)
    bookings[room] = room_bookings
    return new_booking