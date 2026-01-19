// frontend/src/App.tsx
import React, { useEffect, useState } from "react";
import { api } from "./api.ts";

interface Booking {
  start: string;
  end: string;
  code: string;
  room: string;
}

function App() {
  const [rooms, setRooms] = useState<string[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [cancelCodes, setCancelCodes] = useState<Record<string, string>>({});

  useEffect(() => {
    api.get("/rooms").then((res) => setRooms(res.data));
  }, []);

  const fetchBookings = (room: string) => {
    api.get(`/bookings/${room}`).then((res) => setBookings(res.data));
  };

  const bookRoom = () => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const now = new Date();

    if (startDate >= endDate) {
      alert("Start time must be before end time");
      return;
    }

    if (startDate < now) {
      alert("You can't book a time in the past");
      return;
    }

    api
      .post("/book", { room: selectedRoom, start, end })
      .then((res) => {
        alert("Booked! Your code: " + res.data.code);
        fetchBookings(selectedRoom);
      })
      .catch((err) => alert(err.response.data.detail));
  };

  const cancelBooking = (code: string) => {
    api.delete(`/cancel/${selectedRoom}/${code}`)
      .then(() => fetchBookings(selectedRoom))
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
      <select onChange={(e) => { setSelectedRoom(e.target.value); fetchBookings(e.target.value); }}>
        <option value="">Select a room</option>
        {rooms.map(r => <option key={r} value={r}>{r}</option>)}
      </select>

      {selectedRoom && (
        <div style={{ marginTop: "20px" }}>
          <h2>Book {selectedRoom}</h2>
          <input type="datetime-local" value={start} onChange={e => setStart(e.target.value)} />
          <input type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} />
          <button onClick={bookRoom}>Book</button>

          <h3>Existing Bookings</h3>
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
      )}
    </div>
  );
}

export default App;