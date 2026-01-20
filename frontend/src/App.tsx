// frontend/src/App.tsx
import React, { useEffect, useState } from "react";
import { api } from "./api.ts";
import AvailabilityCalendar from "./AvailabilityCalendar.tsx";
import { WeekAvailabilityCalendar } from "./WeekAvailabilityCalendar.tsx";
import { startOfWeek, addDays } from "./utils/dateUtils.ts";

interface Booking {
  start: string;
  end: string;
  code: string;
  room: string;
}

function App() {
  const [rooms, setRooms] = useState<string[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

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
  const [cancelCodes, setCancelCodes] = useState<Record<string, string>>({});

  useEffect(() => {
    api.get("/rooms").then((res) => setRooms(res.data));
  }, []);

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

      setBookingResult(
        `✅ Booking confirmed!\n\nCancellation code: ${res.data.code}`
      );

      // Reset selection
      setStartSelection(null);

    } catch (err: any) {
      const message =
        err.response?.data?.detail || "Failed to create booking.";
      alert(message);
    }
  };

  const prevWeek = () => {
    setWeekStart(addDays(weekStart, -7));
  };

  const nextWeek = () => {
    setWeekStart(addDays(weekStart, 7));
  };

  const cancelBooking = (code: string) => {
    api.delete(`/cancel/${selectedRoom}/${code}`)
      //.then(() => fetchBookings(selectedRoom))
      .catch(err => alert(err.response.data.detail));
  };

  const handleCancelCodeChange = (bookingCode: string, value: string) => {
    setCancelCodes((prev) => ({
      ...prev,
      [bookingCode]: value,
    }));
  };

  return (
    <div style={{ padding: "20px" }}>

      <h1>Meeting Rooms</h1>
      <select onChange={(e) => setSelectedRoom(e.target.value)}>
        <option value="">Select a room</option>
        {rooms.map(r => <option key={r} value={r}>{r}</option>)}
      </select>

      {selectedRoom && (
        <>
          <WeekAvailabilityCalendar
            bookings={bookings}
            weekStart={weekStart}
            duration={duration}
            startSelection={startSelection}
            setStartSelection={setStartSelection}
          />
          <div style={{ marginTop: "20px" }}>
            <h2>Book {selectedRoom}</h2>
            <button onClick={handleBooking} disabled={!startSelection}>
              Book
            </button>

            {bookingResult && <p>{bookingResult}</p>}

            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            >
              <option value={1}>1 hour</option>
              <option value={2}>2 hours</option>
              <option value={3}>3 hours</option>
            </select>

            <button onClick={prevWeek}>Previous week</button>
            <button onClick={nextWeek}>Next week</button>

            <ul>
              {bookings.map((b) => (
                <li key={b.code} style={{ marginBottom: "10px" }}>
                  {new Date(b.start).toLocaleString()} –{" "}
                  {new Date(b.end).toLocaleString()}

                  <div>
                    <input
                      type="text"
                      placeholder="Enter cancellation code"
                      value={cancelCodes[b.code] || ""}
                      onChange={(e) => handleCancelCodeChange(b.code, e.target.value)}
                    />
                    <button
                      onClick={() => cancelBooking(cancelCodes[b.code])}
                      disabled={!cancelCodes[b.code]}
                    >
                      Cancel
                    </button>
                  </div>
                </li>
              ))}
            </ul>

          </div>
        </>
      )}

    </div>
  );
}

export default App;