import axiosInstance from "@/api/axios";

export const fetchLedgerAccountNames = () => {
  return axiosInstance.get("/api/web-fetch-ledger-accountname");
};

export const changeLedgerName = (data) => {
  return axiosInstance.post("/api/web-change-ledger-name", data);
};
