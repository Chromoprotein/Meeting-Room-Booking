from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from uuid import uuid4
from datetime import date, datetime, timezone
from models import CancelResponse, BookingRequest, BookingResponse
from storage import rooms, bookings
from services import create_booking_service

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
    return create_booking_service(
        booking.room,
        booking.start,
        booking.end
    )

@app.delete("/bookings/cancel/{code}", response_model=CancelResponse)
def cancel_booking(code: str):
    for room, room_bookings in bookings.items():
        for booking in room_bookings:
            if booking["code"] == code:
                room_bookings.remove(booking)
                return CancelResponse(
                    room=booking["room"],
                    start=booking["start"],
                    end=booking["end"],
                )

    raise HTTPException(status_code=404, detail="Invalid cancellation code")
