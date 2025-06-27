import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { ContextPanel } from "@/lib/ContextPanel";
import BASE_URL from "@/config/BaseUrl";
import Cookies from "js-cookie";
import { ButtonConfig } from "@/config/ButtonConfig";
export default function LoginAuth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const loadingMessages = [
    "Setting things up for you...",
    "Checking your credentials...",
    "Preparing your dashboard...",
    "Almost there...",
  ];

  useEffect(() => {
    let messageIndex = 0;
    let intervalId;

    if (isLoading) {
      setLoadingMessage(loadingMessages[0]);
      intervalId = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[messageIndex]);
      }, 800);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isLoading]);

  // const handleSubmit = async (event) => {
  //   event.preventDefault();
  //   setIsLoading(true);

  //   const formData = new FormData();
  //   formData.append("username", email);
  //   formData.append("password", password);

  //   try {
  //     const res = await axios.post(`${BASE_URL}/api/web-login`, formData);

  //     if (res.status === 200) {
  //       if (!res.data.UserInfo || !res.data.UserInfo.token) {
  //         console.warn("⚠️ Login failed: Token missing in response");
  //         toast.error("Login Failed: No token received.");
  //         setIsLoading(false);
  //         return;
  //       }

  //       const { UserInfo } = res.data;

  //       console.log("Saving user details to local storage...");
  //       localStorage.setItem("token", UserInfo.token);
  //       localStorage.setItem("id", UserInfo.user.id);
  //       localStorage.setItem("name", UserInfo.user.name);
  //       localStorage.setItem("userType", UserInfo.user.user_type_id);
  //       localStorage.setItem("email", UserInfo.user.email);
       

  //       const redirectPath = window.innerWidth < 768 ? "/home" : "/home";
  //       console.log(`✅ Login successful! Redirecting to ${redirectPath}...`);
  //       navigate(redirectPath);
  //     } else {
  //       console.warn("⚠️ Unexpected API response:", res);
  //       toast.error("Login Failed: Unexpected response.");
  //     }
  //   } catch (error) {
  //     console.error("❌ Login Error:", error.response?.data.message || error.message);

  //     toast({
  //       variant: "destructive",
  //       title: "Login Failed",
  //       description:
  //         error.response?.data?.message || "Please check your credentials.",
  //     });

  //     setIsLoading(false);
  //   }
  // };


  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
  
    const formData = new FormData();
    formData.append("username", email);
    formData.append("password", password);
  
    try {
      const res = await axios.post(`${BASE_URL}/api/web-login`, formData);
  
      if (res.status === 200) {
        if (!res.data.UserInfo || !res.data.UserInfo.token) {
          console.warn("⚠️ Login failed: Token missing in response");
          toast.error("Login Failed: No token received.");
          setIsLoading(false);
          return;
        }
  
        const { UserInfo } = res.data;
        const isProduction = window.location.protocol === "https:";
        
        const cookieOptions = {
          expires: 7,
          secure: isProduction,
          sameSite: "Strict",
        };
  
        console.log("Saving user details to cookies...");
        Cookies.set("token", UserInfo.token, cookieOptions);
        Cookies.set("id", UserInfo.user.id, cookieOptions);
        Cookies.set("name", UserInfo.user.name, cookieOptions);
        Cookies.set("userType", UserInfo.user.user_type_id, cookieOptions);
        Cookies.set("email", UserInfo.user.email, cookieOptions);
  
        const redirectPath = window.innerWidth < 768 ? "/home" : "/home";
        console.log(`✅ Login successful! Redirecting to ${redirectPath}...`);
        navigate(redirectPath);
      } else {
        console.warn("⚠️ Unexpected API response:", res);
        toast.error("Login Failed: Unexpected response.");
      }
    } catch (error) {
      console.error("❌ Login Error:", error.response?.data.message || error.message);
  
      toast({
        variant: "destructive",
        title: "Login Failed",
        description:
          error.response?.data?.message || "Please check your credentials.",
      });
  
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="relative flex flex-col justify-center items-center min-h-screen bg-gray-100"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        initial={{ opacity: 1, x: 0 }}
        exit={{
          opacity: 0,
          x: -window.innerWidth,
          transition: { duration: 0.3, ease: "easeInOut" },
        }}
      >
        {/* <Card className=`w-72 md:w-80 max-w-md ${ButtonConfig.loginBackground} ${ButtonConfig.loginText}`> */}
        <Card
          className={`w-72 md:w-80 max-w-md ${ButtonConfig.loginBackground} ${ButtonConfig.loginText}`}
        >
          <CardHeader>
        {  /*  <img src={logo} alt="logo" className="w-[200px] mx-auto" />  */}
            <CardTitle
              className={`text-2xl text-center${ButtonConfig.loginText}`}
            >
              Login - JaJu-Dev
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label
                    htmlFor="email"
                    className={`${ButtonConfig.loginText}`}
                  >
                    Username
                  </Label>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Input
                      id="email"
                      type="text"
                      placeholder="Enter your username"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                
                    />
                  </motion.div>
                </div>
                <div className="grid gap-2">
                  <Label
                    htmlFor="password"
                    className={`${ButtonConfig.loginText}`}
                  >
                    Password
                  </Label>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Input
                      id="password"
                      type="password"
                      placeholder="*******"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                   
                    />
                  </motion.div>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button
                    type="submit"
                    className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} w-full`}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <motion.span
                        key={loadingMessage}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-sm"
                      >
                        {loadingMessage}
                      </motion.span>
                    ) : (
                      "Sign in"
                    )}
                  </Button>
                </motion.div>
              </div>
            </form>
            <CardDescription
              className={`flex justify-end mt-4 underline ${ButtonConfig.loginText}`}
            >
              <span
                onClick={() => navigate("/forgot-password")}
                className="cursor-pointer "
              >
                {" "}
                Forgot Password
              </span>
            </CardDescription>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
