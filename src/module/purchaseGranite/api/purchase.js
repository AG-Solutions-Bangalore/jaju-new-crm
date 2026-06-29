import axiosInstance from "@/api/axios";

export const fetchPurchaseList = () => {
  return axiosInstance.get("/api/web-fetch-purchase-lists");
};

export const fetchCurrentYear = () => {
  return axiosInstance.get("/api/web-fetch-year");
};

export const fetchProductTypeGroupNew = () => {
  return axiosInstance.get("/api/web-fetch-product-type-group-new");
};

export const fetchProductTypeGroup = () => {
  return axiosInstance.get("/api/web-fetch-product-type-group");
};

export const createPurchase = (payload) => {
  return axiosInstance.post("/api/web-create-purchase", payload);
};

export const fetchPurchaseById = (id) => {
  return axiosInstance.get(`/api/web-fetch-purchase-by-id/${id}`);
};

export const deletePurchaseSubItem = (subId) => {
  return axiosInstance.delete(`/api/web-delete-purchase-sub/${subId}`);
};

export const updatePurchase = (id, payload) => {
  return axiosInstance.put(`/api/web-update-purchase/${id}`, payload);
};
