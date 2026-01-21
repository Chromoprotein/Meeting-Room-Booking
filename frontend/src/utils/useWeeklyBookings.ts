import { useState, useEffect } from "react";
import { getBookingsForWeek } from "../services/BookingService.ts";
import { Booking } from "../utils/types.ts";

export function useWeeklyBookings(room: string, weekStart: Date) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!room) {
      setBookings([]);
      return;
    }

    let cancelled = false;

    async function fetchBookings() {
      setLoading(true);
      try {
        const data = await getBookingsForWeek(room, weekStart);
        if (!cancelled) setBookings(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchBookings();

    return () => {
      cancelled = true;
    };
  }, [room, weekStart]);

  return { bookings, setBookings, loading };
}
