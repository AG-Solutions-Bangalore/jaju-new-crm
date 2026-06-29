import axiosInstance from "@/api/axios";

export const fetchAccountNames = () => {
  return axiosInstance.get("/api/web-fetch-ledger-accountname");
};

export const fetchCurrentYear = () => {
  return axiosInstance.get("/api/web-fetch-year");
};

export const createPaymentReceived = (data) => {
  return axiosInstance.post("/api/web-create-payment-received", data);
};

export const fetchDayBookReport = (data) => {
  return axiosInstance.post("/api/web-fetch-daybook-report", data);
};

export const downloadDayBookReport = (data) => {
  return axiosInstance.post("/api/web-download-daybook-report", data, {
    responseType: "blob",
  });
};

export const fetchDayBookById = (date) => {
  return axiosInstance.get(`/api/web-fetch-daybook-paid-by-id-new/${date}`);
};

export const updateDaybook = (date, data) => {
  return axiosInstance.put(`/api/web-update-daybook-paid-new/${date}`, data);
};
