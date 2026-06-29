import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import moment from "moment";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const Calendar = ({
  currentMonth,
  currentYear,
  highlightedDates = [],
  onDateChange,
  onPrevMonth,
  onNextMonth,
}) => {
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const isDateHighlighted = (date) => {
    const formattedDate = moment(date).format("YYYY-MM-DD");
    return highlightedDates.includes(formattedDate);
  };

  const handleDayClick = (day) => {
    const selectedDate = new Date(currentYear, currentMonth, day);
    const formattedDate = moment(selectedDate).format("YYYY-MM-DD");
    onDateChange(formattedDate, isDateHighlighted(selectedDate));
  };

  const now = new Date();
  const isCurrentMonth =
    currentYear === now.getFullYear() && currentMonth === now.getMonth();

  const days = [];

  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    const isHighlighted = isDateHighlighted(date);

    days.push(
      <button
        key={`day-${day}`}
        onClick={() => handleDayClick(day)}
        className={`h-10 w-10 flex items-center justify-center rounded-full text-sm
          ${
            isHighlighted
              ? "bg-blue-100 text-blue-800 border border-blue-300 hover:bg-blue-200"
              : "text-gray-600 hover:bg-gray-100"
          }`}
      >
        {day}
      </button>,
    );
  }

  const hasEntriesInMonth = highlightedDates.some((dateString) => {
    const d = new Date(dateString);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={onPrevMonth} className="h-8 w-8">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-medium">
          {MONTH_NAMES[currentMonth]} {currentYear}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onNextMonth}
          className="h-8 w-8"
          disabled={isCurrentMonth && now.getDate() >= daysInMonth}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500">
        {DAYS_OF_WEEK.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">{days}</div>

      <div className="mt-4 flex items-center justify-center gap-4">
        {hasEntriesInMonth ? (
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-300"></div>
            <span className="text-xs">Day Book Exists</span>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-white border border-gray-300"></div>
            <span className="text-xs">No Entry</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;
