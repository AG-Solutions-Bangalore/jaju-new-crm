import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchProductList,
  createProduct,
  fetchProductById,
  updateProduct,
} from "../api/product";
import { useToast } from "@/hooks/use-toast";

export const useProductList = () => {
  return useQuery({
    queryKey: ["productType"],
    queryFn: async () => {
      const response = await fetchProductList();
      return response.data.product_type || [];
    },
  });
};

export const useCreateProduct = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: (res) => {
      if (res.data.code == 200) {
        toast({
          title: "Success",
          description: res.data.msg || "Product Created Successfully",
        });
        queryClient.invalidateQueries(["productType"]);
      } else {
        toast({
          title: "Error",
          description: res.data.msg || "Failed to create product",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to create product",
        variant: "destructive",
      });
    },
  });
};

export const useProductById = (id) => {
  return useQuery({
    queryKey: ["productType", id],
    queryFn: async () => {
      const response = await fetchProductById(id);
      return response.data.product_type;
    },
    enabled: !!id,
  });
};

export const useUpdateProduct = (id) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => updateProduct(id, data),
    onSuccess: (res) => {
      if (res.data.code == 200) {
        toast({
          title: "Success",
          description: res.data.msg || "Product Updated Successfully",
        });
        queryClient.invalidateQueries(["productType"]);
      } else {
        toast({
          title: "Error",
          description: res.data.msg || "Failed to update product",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update product",
        variant: "destructive",
      });
    },
  });
};
