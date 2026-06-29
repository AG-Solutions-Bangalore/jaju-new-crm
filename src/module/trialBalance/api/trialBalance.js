import axiosInstance from "@/api/axios";

export const fetchTrialBalanceReport = (payload) => {
  return axiosInstance.post("/api/web-fetch-trialBalance-report", payload);
};
