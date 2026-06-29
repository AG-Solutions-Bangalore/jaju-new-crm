import axiosInstance from "@/api/axios";

export const loginApi = (credentials) => {
  const formData = new FormData();
  formData.append("username", credentials.username);
  formData.append("password", credentials.password);
  return axiosInstance.post("/api/web-login", formData);
};

export const changePasswordApi = (data) => {
  return axiosInstance.post("/api/web-change-password", data);
};
