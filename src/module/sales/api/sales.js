import axiosInstance from "@/api/axios";

export const fetchSalesList = () => {
  return axiosInstance.get("/api/web-fetch-sales-list");
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

export const fetchEstimateById = (id) => {
  return axiosInstance.get(`/api/web-fetch-estimate-by-id/${id}`);
};

export const fetchProductTypesByGroup = (group) => {
  return axiosInstance.get(`/api/web-fetch-product-types/${group}`);
};

export const createSales = (payload) => {
  return axiosInstance.post("/api/web-create-sales", payload);
};

export const createSalesDirect = (payload) => {
  return axiosInstance.post("/api/web-create-sales-direct", payload);
};

export const fetchSalesById = (id) => {
  return axiosInstance.get(`/api/web-fetch-sales-by-id/${id}`);
};

export const deleteSalesSubItem = (subId) => {
  return axiosInstance.delete(`/api/web-delete-sales-sub/${subId}`);
};

export const updateSalesDirect = (id, payload) => {
  return axiosInstance.put(`/api/web-update-sales-direct/${id}`, payload);
};
