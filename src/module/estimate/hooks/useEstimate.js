import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchEstimateList,
  fetchCurrentYear,
  fetchProductTypeGroup,
  fetchLatestEstimateRef,
  createEstimate,
  fetchEstimateById,
} from "../api/estimate";
import { useToast } from "@/hooks/use-toast";

export const useEstimateList = () => {
  return useQuery({
    queryKey: ["estimate"],
    queryFn: async () => {
      const response = await fetchEstimateList();
      return response.data.estimate || [];
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

export const useProductTypeGroup = () => {
  return useQuery({
    queryKey: ["productTypeGroup"],
    queryFn: async () => {
      const response = await fetchProductTypeGroup();
      return response.data.product_type_group || [];
    },
  });
};

export const useLatestEstimateRef = () => {
  return useQuery({
    queryKey: ["latestEstimateRef"],
    queryFn: async () => {
      const response = await fetchLatestEstimateRef();
      return response.data?.estimateRef || "";
    },
  });
};

export const useCreateEstimate = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEstimate,
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.msg || "Estimate Created Successfully",
      });
      queryClient.invalidateQueries(["estimate"]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to create Estimate",
        variant: "destructive",
      });
    },
  });
};

export const useEstimateById = (id) => {
  return useQuery({
    queryKey: ["estimate", id],
    queryFn: async () => {
      const response = await fetchEstimateById(id);
      return response.data;
    },
    enabled: !!id,
  });
};
