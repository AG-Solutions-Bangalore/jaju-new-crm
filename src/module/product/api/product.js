import axiosInstance from "@/api/axios";

export const fetchProductList = () => {
  return axiosInstance.get("/api/web-fetch-product-type-list");
};

export const createProduct = (data) => {
  return axiosInstance.post("/api/web-create-product-type", data);
};

export const fetchProductById = (id) => {
  return axiosInstance.get(`/api/web-fetch-product-type-by-id/${id}`);
};

export const updateProduct = (id, data) => {
  return axiosInstance.put(`/api/web-update-product-type/${id}`, data);
};
