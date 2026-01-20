import React from "react";
import { addDays } from "./utils/dateUtils.ts";

interface Booking {
  start: string;
  end: string;
  code: string;
  room: string;
}

interface Props {
  bookings: Booking[];
  weekStart: Date;
  duration: number;
  setDuration: (v: number) => void;
  startSelection: { date: Date; hour: number } | null;
  setStartSelection: (v: { date: Date; hour: number }) => void;
}

const HOURS_START = 8;
const HOURS_END = 20;

export const WeekAvailabilityCalendar: React.FC<Props> = ({
  bookings,
  weekStart,
  duration,
  setDuration,
  startSelection,
  setStartSelection,
}) => {

  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from(
    { length: HOURS_END - HOURS_START },
    (_, i) => HOURS_START + i
  );

  const overlaps = (start: Date, end: Date) =>
    bookings.some((b) => {
      const bs = new Date(b.start);
      const be = new Date(b.end);
      return !(end <= bs || start >= be);
    });

const canStartHere = (date: Date, hour: number) => {
  const start = new Date(date);
  start.setHours(hour, 0, 0, 0);

  // Only check 1-hour startability (we’ll extend in selection logic)
  const end = new Date(start);
  end.setHours(hour + 1);

  if (start < today) return false;
  if (hour + 1 > HOURS_END) return false;

  return !overlaps(start, end);
};

  const isSelectedBlock = (date: Date, hour: number) => {
    if (!startSelection) return false;
    const selStart = new Date(startSelection.date);
    selStart.setHours(startSelection.hour);
    const selEnd = new Date(selStart);
    selEnd.setHours(selStart.getHours() + duration);

    const slotStart = new Date(date);
    slotStart.setHours(hour);
    const slotEnd = new Date(slotStart);
    slotEnd.setHours(hour + 1);

    return !(slotEnd <= selStart || slotStart >= selEnd);
  };

const handleSlotClick = (date: Date, hour: number) => {
  const MAX_DURATION = 3;

  // Must be selectable to start
  if (!canStartHere(date, hour)) return;

  if (!startSelection) {
    setStartSelection({ date, hour });
    setDuration(1);
    return;
  }

  // Only allow interaction on the same day
  if (date.toDateString() !== startSelection.date.toDateString()) {
    setStartSelection({ date, hour });
    setDuration(1);
    return;
  }

  const selStartHour = startSelection.hour;
  const selEndHour = selStartHour + duration - 1;

  // Click outside current max window → reset
  if (hour < selStartHour || hour > selStartHour + MAX_DURATION - 1) {
    setStartSelection({ date, hour });
    setDuration(1);
    return;
  }

  // Click inside current selection → adjust duration
  let newStartHour = selStartHour;
  let newDuration = hour - selStartHour + 1;

  if (hour < selStartHour) {
    newStartHour = hour;
    newDuration = selStartHour - hour + 1;
  }

  // Cap duration at MAX_DURATION
  if (newDuration > MAX_DURATION) {
    if (hour < selStartHour) {
      newStartHour = selStartHour - MAX_DURATION + 1;
      newDuration = MAX_DURATION;
    } else {
      newDuration = MAX_DURATION;
    }
  }

  const start = new Date(startSelection.date);
  start.setHours(newStartHour, 0, 0, 0);

  const end = new Date(start);
  end.setHours(start.getHours() + newDuration);

  // Prevent overlapping bookings
  if (overlaps(start, end)) return;

  setStartSelection({ date: startSelection.date, hour: newStartHour });
  setDuration(newDuration);
};

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "80px repeat(7, 1fr)" }}>
        <div />
        {days.map((d) => (
          <div key={d.toDateString()} style={{ textAlign: "center" }}>
            {d.toLocaleDateString(undefined, { weekday: "short", day: "numeric" })}
          </div>
        ))}

        {hours.map((h) => (
          <React.Fragment key={h}>
            <div>{h}:00</div>
            {days.map((d) => {
              const selectable = canStartHere(d, h);
              const selected = isSelectedBlock(d, h);

              let bg = "#34d399";
              if (!selectable) bg = "#f87171";
              if (selected) bg = "#60a5fa";

              return (
                <div
                  key={d.toDateString()}
                  onClick={() => handleSlotClick(d, h)}
                  style={{
                    height: "36px",
                    margin: "2px",
                    borderRadius: "4px",
                    background: bg,
                  }}
                />
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
