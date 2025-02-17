import { Calendar } from 'lucide-react';
import { useState } from 'react';
import { MonthlyCalendar } from '../MonthlyCalendar';

interface CalendarBadgeProps {
  onClick?: () => void;
}

export function CalendarBadge({ onClick }: CalendarBadgeProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleCalendarClick = () => {
    setIsCalendarOpen(true);
    onClick?.();
  };

  const handleCalendarClose = () => {
    setIsCalendarOpen(false);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setIsCalendarOpen(false);
  };

  return (
    <>
      <button
        onClick={handleCalendarClick}
        className="relative p-2 rounded-xl hover:bg-white/80 transition-all duration-200 group"
        aria-label="Calendar"
      >
        <Calendar className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
      </button>

      <MonthlyCalendar
        isOpen={isCalendarOpen}
        onClose={handleCalendarClose}
        selectedDate={selectedDate}
        onSelectDate={handleDateSelect}
        tasks={[]} // Pass your tasks here if needed
      />
    </>
  );
}