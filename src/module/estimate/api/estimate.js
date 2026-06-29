import axiosInstance from "@/api/axios";

export const fetchEstimateList = () => {
  return axiosInstance.get("/api/web-fetch-estimate-list");
};

export const fetchCurrentYear = () => {
  return axiosInstance.get("/api/web-fetch-year");
};

export const fetchProductTypeGroup = () => {
  return axiosInstance.get("/api/web-fetch-product-type-group");
};

export const fetchLatestEstimateRef = () => {
  return axiosInstance.get("/api/web-fetch-estimate-latest/2023-24");
};

export const createEstimate = (payload) => {
  return axiosInstance.post("/api/web-create-estimate", payload);
};

export const fetchEstimateById = (id) => {
  return axiosInstance.get(`/api/web-fetch-estimate-by-id/${id}`);
};
