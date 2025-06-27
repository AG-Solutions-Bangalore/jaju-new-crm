import BASE_URL from "@/config/BaseUrl";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";

export const useCurrentYear = () => {
  const fetchCurrentYear = async () => {
    const token = Cookies.get("token");
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(
      `${BASE_URL}/api/panel-fetch-year`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) throw new Error("Failed to fetch year data");
    return response.json();
  };

  return useQuery({
    queryKey: ["currentYear"],
    queryFn: fetchCurrentYear,
    select: (data) => data.year.current_year, 
  });
};