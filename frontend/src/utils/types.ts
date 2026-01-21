export interface Booking {
  start: string;
  end: string;
  code: string;
  room: string;
}

export interface Props {
  bookings: Booking[];
  weekStart: Date;
  duration: number;
  setDuration: (v: number) => void;
  startSelection: { date: Date; hour: number } | null;
  setStartSelection: (v: { date: Date; hour: number }) => void;
}