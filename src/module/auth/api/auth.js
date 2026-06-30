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

export const forgotPasswordApi = (data) => {
  const formData = new FormData();
  formData.append("username", data.username);
  formData.append("email", data.email);
  // Optional name field to support legacy format
  formData.append("name", data.username);
  return axiosInstance.post(
    `/api/web-send-password?username=${encodeURIComponent(data.username)}&email=${encodeURIComponent(data.email)}`,
    formData
  );
};
