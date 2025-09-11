"use client";

import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";

interface CalendarWrapperProps {
  selectedDate?: Date;
  onDateChange?: (date: Date | undefined) => void;
  getDateIcon?: (date: Date) => string | null;
  className?: string;
}

export default function CalendarWrapper({
  selectedDate,
  onDateChange,
  getDateIcon,
  className = "",
}: CalendarWrapperProps) {
  const [date, setDate] = useState<Date | undefined>(selectedDate || new Date());

  const handleDateSelect = (newDate: Date | undefined) => {
    setDate(newDate);
    onDateChange?.(newDate);
  };

  return (
    <div className={`rounded-lg ${className}`}>
      <Calendar
        mode="single"
        selected={date}
        onSelect={handleDateSelect}
        className="rounded-md"
        components={{
          Day: (props) => {
            const dayDate = props.day.date;
            const icon = getDateIcon?.(dayDate);
            const isSelected =
              date && dayDate.toDateString() === date.toDateString();

            return (
              <div
                {...props}
                role="button"
                className={`h-9 w-9 relative flex items-center justify-center p-0 font-normal rounded-full transition-colors ${
                  isSelected
                    ? "bg-blue-500 text-white"
                    : icon
                    ? "bg-blue-500/20 hover:bg-blue-500/30"
                    : "hover:bg-slate-600/30 text-white/80"
                }`}
              >
                {icon ? (
                  <>
                    <span className="absolute top-0.5 left-1.5 text-[10px] text-white/60">
                      {dayDate.getDate()}
                    </span>
                    <span className="text-lg">{icon}</span>
                  </>
                ) : (
                  dayDate.getDate()
                )}
              </div>
            );
          },
        }}
        classNames={{
          head_cell:
            "text-white/60 rounded-md w-9 font-normal text-[0.8rem]",
          cell: "text-center text-sm p-0 relative w-9 text-white/80",
          caption_label: "text-sm font-medium",
          row: "flex w-full mt-2 justify-between",
          head_row: "flex justify-between",
        }}
      />
    </div>
  );
}
