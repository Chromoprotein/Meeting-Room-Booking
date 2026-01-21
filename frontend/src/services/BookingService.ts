import { api } from "../api.ts";
import { addDays } from "../utils/dateUtils.ts";
import { Booking } from "../utils/types.ts";

export const getRooms = async (): Promise<string[]> => {
  const res = await api.get("/rooms");
  return res.data;
};

export const getBookingsForWeek = async (
  room: string,
  weekStart: Date
): Promise<Booking[]> => {
  const start = weekStart.toISOString().split("T")[0];
  const end = addDays(weekStart, 6).toISOString().split("T")[0];

  const res = await api.get(`/bookings/${room}`, {
    params: { start_date: start, end_date: end },
  });

  return res.data;
};

export const createBooking = async (
  room: string,
  start: Date,
  end: Date
) => {
  const res = await api.post("/book", {
    room,
    start: start.toISOString(),
    end: end.toISOString(),
  });
  return res.data;
};

export const cancelBooking = async (code: string) => {
  const res = await api.delete(`/bookings/cancel/${code}`);
  return res.data;
};
