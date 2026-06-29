import { useQuery, useMutation } from "@tanstack/react-query";
import {
  fetchAccountNames,
  fetchCurrentYear,
  createPaymentReceived,
} from "../api/dayBook";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export const useAccountNames = () => {
  return useQuery({
    queryKey: ["ledgerAccountNames"],
    queryFn: async () => {
      const response = await fetchAccountNames();
      return response.data.mix || [];
    },
  });
};

export const useCurrentYear = () => {
  return useQuery({
    queryKey: ["currentYear"],
    queryFn: async () => {
      const response = await fetchCurrentYear();
      return response.data.year?.current_year;
    },
  });
};

export const useCreatePaymentReceived = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: createPaymentReceived,
    onSuccess: (res) => {
      if (res.data.code === 200) {
        toast({
          title: "Success",
          description: "Day Book Created Successfully",
        });
        navigate("/home");
      } else {
        toast({
          title: "Error",
          description: res.data.message || "Failed to create day book",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to create day book",
        variant: "destructive",
      });
    },
  });
};
