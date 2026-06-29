import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchPurchaseList,
  fetchCurrentYear,
  fetchProductTypeGroupNew,
  fetchProductTypeGroup,
  createPurchase,
  fetchPurchaseById,
  deletePurchaseSubItem,
  updatePurchase,
} from "../api/purchase";
import { useToast } from "@/hooks/use-toast";

export const usePurchaseList = () => {
  return useQuery({
    queryKey: ["purchaseGranite"],
    queryFn: async () => {
      const response = await fetchPurchaseList();
      return response.data.purchase || [];
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

export const useProductTypeGroupNew = () => {
  return useQuery({
    queryKey: ["productTypeGroupNew"],
    queryFn: async () => {
      const response = await fetchProductTypeGroupNew();
      return (
        response.data.data ||
        response.data.product_type ||
        response.data.product_type_group ||
        response.data.product_type_group_new ||
        []
      );
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

export const useCreatePurchase = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPurchase,
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.msg || "Purchase Created Successfully",
      });
      queryClient.invalidateQueries(["purchaseGranite"]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to create Purchase",
        variant: "destructive",
      });
    },
  });
};

export const usePurchaseById = (id) => {
  return useQuery({
    queryKey: ["purchaseGranite", id],
    queryFn: async () => {
      const response = await fetchPurchaseById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useDeletePurchaseSubItem = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: deletePurchaseSubItem,
    onSuccess: (data) => {
      toast({
        title: "Deleted",
        description: data.msg || "Sub item deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to delete sub item",
        variant: "destructive",
      });
    },
  });
};

export const useUpdatePurchase = (id) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => updatePurchase(id, payload),
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.msg || "Purchase Updated Successfully",
      });
      queryClient.invalidateQueries(["purchaseGranite"]);
      queryClient.invalidateQueries(["purchaseGranite", id]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update Purchase",
        variant: "destructive",
      });
    },
  });
};
