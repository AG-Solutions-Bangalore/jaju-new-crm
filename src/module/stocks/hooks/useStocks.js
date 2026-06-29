import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  fetchStockNewReport,
  fetchStockNewReportByItem,
  fetchProductTypeList,
  fetchProductTypeGroupNew,
  createProductType,
  updateProductType,
} from "../api/stocks";

export const useStocksReport = (searchParams) => {
  return useQuery({
    queryKey: ["stocksReport", searchParams],
    queryFn: async () => {
      if (!searchParams) return { stocks: [] };
      const response = await fetchStockNewReport(searchParams);
      return response.data;
    },
    enabled: !!searchParams,
  });
};

export const useStocksReportByItem = (searchParams) => {
  return useQuery({
    queryKey: ["stocksReportByItem", searchParams],
    queryFn: async () => {
      if (!searchParams) return null;
      const response = await fetchStockNewReportByItem(searchParams);
      return response.data;
    },
    enabled: !!searchParams,
  });
};

export const useProductTypes = () => {
  return useQuery({
    queryKey: ["productTypes"],
    queryFn: async () => {
      const response = await fetchProductTypeList();
      return response.data?.productType || [];
    },
  });
};

export const useProductGroups = () => {
  return useQuery({
    queryKey: ["productGroups"],
    queryFn: async () => {
      const response = await fetchProductTypeGroupNew();
      return (
        response.data?.data ||
        response.data?.product_type ||
        response.data?.product_type_group ||
        response.data?.product_type_group_new ||
        []
      );
    },
  });
};

export const useCreateProductType = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProductType,
    onSuccess: () => {
      toast({ title: "Success", description: "New item created successfully" });
      queryClient.invalidateQueries({ queryKey: ["productTypes"] });
      queryClient.invalidateQueries({ queryKey: ["productGroups"] });
      queryClient.invalidateQueries({ queryKey: ["stocksReport"] });
      queryClient.invalidateQueries({ queryKey: ["stocksReportByItem"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create item",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateProductType = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateProductType(id, data),
    onSuccess: () => {
      toast({ title: "Success", description: "Item renamed successfully" });
      queryClient.invalidateQueries({ queryKey: ["productTypes"] });
      queryClient.invalidateQueries({ queryKey: ["productGroups"] });
      queryClient.invalidateQueries({ queryKey: ["stocksReport"] });
      queryClient.invalidateQueries({ queryKey: ["stocksReportByItem"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to rename item",
        variant: "destructive",
      });
    },
  });
};
