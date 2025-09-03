import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from "lucide-react";

import axios from "axios";

import { useToast } from "@/hooks/use-toast";
import moment from "moment";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import Page from "../dashboard/page";
import BASE_URL from "@/config/BaseUrl";
import Cookies from "js-cookie";

const Home = () => {
  const [date, setDate] = useState(new Date());
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [initialLoad, setInitialLoad] = useState(true);
const token = Cookies.get("token")
  // Fetch highlighted dates
  const { data: highlightedDates = [] } = useQuery({
    queryKey: ["daybookDates"],
    queryFn: async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/web-fetch-daybook-date`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return response?.data?.received_date.map(item => item.received_date);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch dates",
          variant: "destructive",
        });
        return [];
      }
    },
  });
  useEffect(() => {
    if (highlightedDates.length > 0 && initialLoad) {
      // Find the most recent date with daybook entry
      const sortedDates = highlightedDates
        .map(date => new Date(date))
        .sort((a, b) => b - a); // Sort in descending order (most recent first)
      
      if (sortedDates.length > 0) {
        const latestDate = sortedDates[0];
        setCurrentMonth(latestDate.getMonth());
        setCurrentYear(latestDate.getFullYear());
      }
      setInitialLoad(false);
    }
  }, [highlightedDates, initialLoad]);
  const isDateHighlighted = (date) => {
    const formattedDate = moment(date).format("YYYY-MM-DD");
    return highlightedDates.includes(formattedDate);
  };

  const handleDateChange = (day) => {
    const selectedDate = new Date(currentYear, currentMonth, day);
    const formattedDate = moment(selectedDate).format("YYYY-MM-DD");

    if (isDateHighlighted(selectedDate)) {
      navigate("/edit-daybook", { state: { selectedDate: formattedDate } });
    } else {
      navigate("/add-daybook", { state: { selectedDate: formattedDate } });
    }
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };
  const hasEntriesInCurrentMonth = () => {
    return highlightedDates.some(dateString => {
      const date = new Date(dateString);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
  };
  const renderCalendar = () => {
    const monthNames = ["January", "February", "March", "April", "May", "June", 
      "July", "August", "September", "October", "November", "December"];
    
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    // ------
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
    // ----
    const days = [];
    
    // Empty cells for days before the first of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const isHighlighted = isDateHighlighted(date);
      
      days.push(
        <button
          key={`day-${day}`}
          onClick={() => handleDateChange(day)}
          className={`h-10 w-10 flex items-center justify-center rounded-full text-sm
            ${isHighlighted 
              ? 'bg-blue-100 text-blue-800 border border-blue-300 hover:bg-blue-200' 
              : 'text-gray-600 hover:bg-gray-100'}`}
        >
          {day}
        </button>
      );
    }
    
    const now = new Date();
    const isCurrentMonth = currentYear === now.getFullYear() && currentMonth === now.getMonth();

    return (
      <div className="space-y-4 ">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevMonth}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <h3 className="text-lg font-medium">
            {monthNames[currentMonth]} {currentYear}
          </h3>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextMonth}
            className="h-8 w-8"
            disabled={isCurrentMonth && now.getDate() >= daysInMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day}>{day}</div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
      </div>
    );
  };

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
          {renderCalendar()}
          <div className="mt-4 flex items-center justify-center gap-4">
            {hasEntriesInCurrentMonth() ?
            (
<>
<div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-300"></div>
              <span className="text-xs">Day Book Exists</span>
            </div>
</>

            ):(

              <>
               <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-white border border-gray-300"></div>
              <span className="text-xs">No Entry</span>
            </div>
              </>
            )
          }
           
           
          </div>
        </CardContent>
      </Card>
    </Page>
  );
};

export default Home;