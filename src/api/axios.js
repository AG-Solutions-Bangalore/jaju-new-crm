import axios from "axios";
import BASE_URL from "@/config/BaseUrl";
import Cookies from "js-cookie";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove("token");
      Cookies.remove("id");
      Cookies.remove("name");
      Cookies.remove("userType");
      Cookies.remove("email");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
