// frontend/src/App.tsx
import React, { useEffect, useState } from "react";
import { api } from "./api.ts";
import { WeekAvailabilityCalendar } from "./WeekAvailabilityCalendar.tsx";
import { startOfWeek, addDays } from "./utils/dateUtils.ts";
import { Booking } from "./utils/types.ts";
import Button from "./components/Button.tsx";
import Subheading from "./components/Subheading.tsx";
import Container from "./components/Container.tsx";

function App() {
  // List of all rooms
  const [rooms, setRooms] = useState<string[]>([]);
  // List of a week's bookings in a room
  const [bookings, setBookings] = useState<Booking[]>([]);

  // States for booking a room
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [duration, setDuration] = useState(1);
  const [startSelection, setStartSelection] = useState<{
    date: Date;
    hour: number;
  } | null>(null);

  // Message shown after booking
  const [bookingResult, setBookingResult] = useState<string | null>(null);

  // For navigation
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));

  // For cancelling a booking
  const [cancelCode, setCancelCode] = useState("");
  const [cancelResult, setCancelResult] = useState<string | null>(null);

  // Fetch the list of rooms
  useEffect(() => {
    api.get("/rooms").then((res) => setRooms(res.data));
  }, []);

  // Fetch the bookings of a room for a week
  const fetchBookingsForWeek = async (room: string, weekStart: Date) => {
    const start = weekStart.toISOString().split("T")[0];
    const end = addDays(weekStart, 6).toISOString().split("T")[0];

    const res = await api.get(`/bookings/${room}`, {
      params: { start_date: start, end_date: end },
    });

    setBookings(res.data);
  };

  useEffect(() => {
    if (!selectedRoom) return;
    fetchBookingsForWeek(selectedRoom, weekStart);
  }, [selectedRoom, weekStart]);

  // Booking event handler
  const handleBooking = async () => {
    if (!selectedRoom || !startSelection) {
      alert("Please select a room and a time slot.");
      return;
    }

    const start = new Date(startSelection.date);
    start.setHours(startSelection.hour, 0, 0, 0);

    const end = new Date(start);
    end.setHours(start.getHours() + duration);

    // Extra frontend safety (backend also checks)
    if (start >= end) {
      alert("Start time must be before end time.");
      return;
    }

    if (start < new Date()) {
      alert("You cannot book a time in the past.");
      return;
    }

    try {
      const res = await api.post("/book", {
        room: selectedRoom,
        start: start.toISOString(),
        end: end.toISOString(),
      });

      const { code, room, start: s, end: e } = res.data;
      setBookingResult(
        `✅ Booking confirmed!\nRoom: ${room}\nTime: ${new Date(s).toLocaleString()} - ${new Date(e).toLocaleTimeString()}\nCode: ${code}`
      );

      // Reset selection
      setStartSelection(null);

      // Re-fetch bookings for current room/week
      if (selectedRoom) {
        fetchBookingsForWeek(selectedRoom, weekStart);
      }

    } catch (err: any) {
      const message =
        err.response?.data?.detail || "Failed to create booking.";
      alert(message);
    }
  };

  // Navigate to the previous or next week
  const prevWeek = () => {
    setWeekStart(addDays(weekStart, -7));
  };

  const nextWeek = () => {
    setWeekStart(addDays(weekStart, 7));
  };

  // Cancel booking event handler
  const handleCancelBooking = async () => {
    if (!cancelCode.trim()) {
      alert("Please enter a cancellation code.");
      return;
    }

    try {
      const res = await api.delete(`/bookings/cancel/${cancelCode.trim()}`);

      const { room, start, end } = res.data;

      setCancelResult(
        `✅ Booking cancelled!\nRoom: ${room}\nTime: ${new Date(start).toLocaleString()} - ${new Date(end).toLocaleTimeString()}`
      );
      setCancelCode("");

      // Refresh bookings for current room/week
      if (selectedRoom) {
        fetchBookingsForWeek(selectedRoom, weekStart);
      }

    } catch (err: any) {
      const message =
        err.response?.data?.detail || "Failed to cancel booking.";
      alert(message);
    }
  };

  return (
    <div className="p-20">

      <h1 className="text-lg font-semibold p-2 m-2">Meeting Rooms</h1>

      <select 
        className="bg-zinc-100 transition-colors border-black border-b-2 hover:border-indigo-600 focus:border-indigo-600 focus:outline-hidden p-2 m-2 max-w-96"
        onChange={(e) => setSelectedRoom(e.target.value)}>
        <option value="">Select a room</option>
        {rooms.map(r => <option key={r} value={r}>{r}</option>)}
      </select>

      {selectedRoom && (
        <>
          <WeekAvailabilityCalendar
            bookings={bookings}
            weekStart={weekStart}
            duration={duration}
            setDuration={setDuration}
            startSelection={startSelection}
            setStartSelection={setStartSelection}
          />

          <div className="flex justify-evenly">
            <Button onClick={prevWeek}>Previous Week</Button>
            <Button onClick={handleBooking} isDisabled={!startSelection}>Book {selectedRoom}</Button>
            <Button onClick={nextWeek}>Next Week</Button>
          </div>

          <div className="mt-20">
            
            {bookingResult && <Container>{bookingResult}</Container>}
            
            <Container>
              <>
                <Subheading>Booked times</Subheading>
                <ul className="flex flex-col gap-3">
                  {bookings.map((b) => (
                    <li key={b.code}>
                      {new Date(b.start).toLocaleString()} –{" "}
                      {new Date(b.end).toLocaleString()}
                    </li>
                  ))}
                </ul>
              </>
            </Container>

          </div>
        </>
      )}

      <Container>
        <>
          <Subheading>Cancel a booking</Subheading>

          <input
            type="text"
            placeholder="Enter cancellation code"
            value={cancelCode}
            onChange={(e) => setCancelCode(e.target.value)}
            className="bg-zinc-100 transition-colors border-black border-b-2 hover:border-indigo-600 focus:border-indigo-600 focus:outline-hidden p-2 m-2 max-w-96"
          />

          <Button onClick={handleCancelBooking}>Cancel Booking</Button>

          {cancelResult && <p>{cancelResult}</p>}
        </>
      </Container>

    </div>
  );
}

export default App;