import { ReactNode } from "react";

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

export interface ButtonProps {
  isDisabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}

export interface ChildrenProps {
  children: ReactNode;
}

export interface CancelProps {
  onCancel: (code: string) => Promise<string>;
}