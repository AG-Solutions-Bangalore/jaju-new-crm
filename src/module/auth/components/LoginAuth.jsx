import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ButtonConfig } from "@/config/ButtonConfig";
import { useLogin } from "@/module/auth/hooks/useAuth";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

export default function LoginAuth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useLogin();
  const isLoading = loginMutation.isPending;

  const loadingMessages = [
    "Setting things up for you...",
    "Checking your credentials...",
    "Preparing your dashboard...",
    "Almost there...",
  ];

  const handleSubmit = (event) => {
    event.preventDefault();
    loginMutation.mutate({ username: email, password });
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
              JaJu Flooring
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
                      minLength={1}
                      maxLength={50}
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
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="*******"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={1}
                        maxLength={16}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
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
                        Signing in...
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
              <span className="cursor-pointer "> Forgot Password</span>
            </CardDescription>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
