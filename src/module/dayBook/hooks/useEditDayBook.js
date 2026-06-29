import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchDayBookById, updateDaybook } from "../api/dayBook";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export const useEditDayBook = (date, options = {}) => {
  return useQuery({
    queryKey: ["daybookData", date],
    queryFn: async () => {
      if (!date) return null;
      const response = await fetchDayBookById(date);
      return response.data;
    },
    enabled: !!date,
    ...options,
  });
};

export const useUpdateDaybook = (date) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload) => updateDaybook(date, payload),
    onSuccess: (res) => {
      if (res.data.code === 200) {
        toast({
          title: "Success",
          description: "Day Book Updated Successfully",
        });
        navigate("/home");
      } else {
        toast({
          title: "Error",
          description: res.data.message || "Failed to update day book",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update day book",
        variant: "destructive",
      });
    },
  });
};
