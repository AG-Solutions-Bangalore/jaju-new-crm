import axiosInstance from "@/api/axios";

export const fetchStockNewReport = (payload) => {
  return axiosInstance.post("/api/web-fetch-stock-new-report", payload);
};

export const fetchStockNewReportByItem = (payload) => {
  return axiosInstance.post("/api/web-fetch-stock-new-report-by-item", payload);
};

export const fetchProductTypeList = () => {
  return axiosInstance.get("/api/web-fetch-product-type-list");
};

export const fetchProductTypeGroupNew = () => {
  return axiosInstance.get("/api/web-fetch-product-type-group-new");
};

export const createProductType = (payload) => {
  return axiosInstance.post("/api/web-create-product-type", payload);
};

export const updateProductType = (id, payload) => {
  return axiosInstance.put(`/api/web-update-product-type/${id}`, payload);
};
