import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays } from "lucide-react";
import Page from "@/app/dashboard/page";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useDaybookDates } from "../hooks/useHome";
import Calendar from "../components/Calendar";

const HomePage = () => {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [initialLoad, setInitialLoad] = useState(true);

  const { data: highlightedDates = [] } = useDaybookDates();

  useEffect(() => {
    if (highlightedDates.length > 0 && initialLoad) {
      const sortedDates = highlightedDates
        .map((date) => new Date(date))
        .sort((a, b) => b - a);

      if (sortedDates.length > 0) {
        const latestDate = sortedDates[0];
        setCurrentMonth(latestDate.getMonth());
        setCurrentYear(latestDate.getFullYear());
      }
      setInitialLoad(false);
    }
  }, [highlightedDates, initialLoad]);

  const handleDateChange = useCallback(
    (formattedDate, isHighlighted) => {
      if (isHighlighted) {
        navigate("/edit-daybook", { state: { selectedDate: formattedDate } });
      } else {
        navigate("/add-daybook", { state: { selectedDate: formattedDate } });
      }
    },
    [navigate],
  );

  const handlePrevMonth = useCallback(() => {
    setCurrentMonth((prev) => {
      if (prev === 0) {
        setCurrentYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentMonth((prev) => {
      if (prev === 11) {
        setCurrentYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  }, []);

  return (
    <Page>
      <Card className="mx-auto max-w-md mt-5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Day Book Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            currentMonth={currentMonth}
            currentYear={currentYear}
            highlightedDates={highlightedDates}
            onDateChange={handleDateChange}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
          />
        </CardContent>
      </Card>
    </Page>
  );
};

export default HomePage;
