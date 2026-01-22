// frontend/src/App.tsx
import React, { useEffect, useState } from "react";
import CancelBooking from "./CancelBooking.tsx";
import { WeekAvailabilityCalendar } from "./WeekAvailabilityCalendar.tsx";
import { startOfWeek, addDays } from "../utils/dateUtils.ts";
import Button from "./Button.tsx";
import Subheading from "./Subheading.tsx";
import Container from "./Container.tsx";
import { getRooms, getBookingsForWeek, cancelBooking, createBooking } from "../services/BookingService.ts";
import { useWeeklyBookings } from "../utils/useWeeklyBookings.ts";

function App() {
  // List of all rooms
  const [rooms, setRooms] = useState<string[]>([]);

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

  // Custom hooks for fetching bookings
  const { bookings, setBookings, loading } = useWeeklyBookings(selectedRoom, weekStart);

  // Fetch the list of rooms
  useEffect(() => {
    getRooms().then(setRooms);
  }, []);

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

      const { code, room, start: s, end: e } = await createBooking(selectedRoom, start, end);
      setBookingResult(
        `✅ Booking confirmed!\nRoom: ${room}\nTime: ${new Date(s).toLocaleString()} - ${new Date(e).toLocaleTimeString()}\nCode: ${code}`
      );

      // Reset selection
      setStartSelection(null);

      // Re-fetch bookings for current room/week
      if (selectedRoom) {
        const updated = await getBookingsForWeek(selectedRoom, weekStart);
        setBookings(updated);
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
  const handleCancel = async (code: string) => {
    const { room, start, end } = await cancelBooking(code);

    // Refresh bookings if relevant
    if (selectedRoom) {
      const updated = await getBookingsForWeek(selectedRoom, weekStart);
      setBookings(updated);
    }

    return `✅ Booking cancelled!\nRoom: ${room}\nTime: ${new Date(start).toLocaleString()} - ${new Date(end).toLocaleTimeString()}`;
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
                {loading && <p>Loading data...</p>}
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

      <CancelBooking onCancel={handleCancel}/>

    </div>
  );
}

export default App;