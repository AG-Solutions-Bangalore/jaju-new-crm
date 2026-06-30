import { useMutation } from "@tanstack/react-query";
import { loginApi, changePasswordApi, forgotPasswordApi } from "../api/auth";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const useLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  return useMutation({
    mutationFn: loginApi,
    onSuccess: (res) => {
      if (!res.data.UserInfo?.token) {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "No token received.",
        });
        return;
      }

      const { UserInfo } = res.data;
      const isProduction = window.location.protocol === "https:";
      const cookieOptions = {
        expires: 7,
        secure: isProduction,
        sameSite: "Strict",
      };

      Cookies.set("token", UserInfo.token, cookieOptions);
      Cookies.set("id", UserInfo.user.id, cookieOptions);
      Cookies.set("name", UserInfo.user.name, cookieOptions);
      Cookies.set("userType", UserInfo.user.user_type_id, cookieOptions);
      Cookies.set("email", UserInfo.user.email, cookieOptions);

      navigate("/sale-dashboard");
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description:
          error.response?.data?.message || "Please check your credentials.",
      });
    },
  });
};

export const useChangePassword = ({ onSuccess } = {}) => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: changePasswordApi,
    onSuccess: (res) => {
      if (res?.data.code == 200) {
        toast({
          title: "Success",
          description: res.data.msg,
        });
        onSuccess?.();
      } else {
        toast({
          title: "Error",
          description: res.data.msg,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to change password",
        variant: "destructive",
      });
    },
  });
};

export const useForgotPassword = ({ onSuccess } = {}) => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: forgotPasswordApi,
    onSuccess: (res) => {
      if (res?.data?.code === 200) {
        toast({
          title: "Success",
          description: res.data.msg || "Password sent successfully.",
        });
        onSuccess?.();
      } else {
        toast({
          title: "Error",
          description: res.data?.msg || "Unexpected response from server.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to send password reset request.",
        variant: "destructive",
      });
    },
  });
};
