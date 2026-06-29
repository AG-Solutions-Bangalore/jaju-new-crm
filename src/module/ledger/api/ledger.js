import axiosInstance from "@/api/axios";

export const fetchAccountNames = () => {
  return axiosInstance.get("/api/web-fetch-ledger-accountname");
};

export const fetchLedgerReport = (data) => {
  return axiosInstance.post("/api/web-fetch-ledger-report-new", data);
};

export const downloadLedgerReport = (data) => {
  return axiosInstance.post("/api/web-download-ledger-report-new", data, {
    responseType: "blob",
  });
};
