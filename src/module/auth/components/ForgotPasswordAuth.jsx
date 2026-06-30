import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ButtonConfig } from "@/config/ButtonConfig";
import { useForgotPassword } from "@/module/auth/hooks/useAuth";
import { motion } from "framer-motion";

export default function ForgotPasswordAuth() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const forgotMutation = useForgotPassword({
    onSuccess: () => {
      navigate("/");
    },
  });

  const isLoading = forgotMutation.isPending;

  const [loadingMessage, setLoadingMessage] = useState("");
  const loadingMessages = [
    "Verifying your details...",
    "Sending password...",
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

  const handleSubmit = (event) => {
    event.preventDefault();
    forgotMutation.mutate({ username, email });
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
        <Card
          className={`w-72 md:w-80 max-w-md ${ButtonConfig.loginBackground} ${ButtonConfig.loginText}`}
        >
          <CardHeader>
            <CardTitle
              className={`text-2xl text-center${ButtonConfig.loginText}`}
            >
              Forgot Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label
                    htmlFor="username"
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
                      id="username"
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      minLength={1}
                      maxLength={50}
                      required
                    />
                  </motion.div>
                </div>

                <div className="grid gap-2">
                  <Label
                    htmlFor="email"
                    className={`${ButtonConfig.loginText}`}
                  >
                    Email
                  </Label>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      minLength={1}
                      maxLength={50}
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
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-sm"
                      >
                        {loadingMessage}
                      </motion.span>
                    ) : (
                      "Reset Password"
                    )}
                  </Button>
                </motion.div>
              </div>
            </form>
            <CardDescription
              className={`flex justify-end mt-4 underline ${ButtonConfig.loginText}`}
            >
              <span onClick={() => navigate("/")} className="cursor-pointer">
                {" "}
                Sign In
              </span>
            </CardDescription>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
