import { useEffect, useState } from "react";

const useAuth = () => {
  const [authData, setAuthData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = {
      id: localStorage.getItem("id"),
      name: localStorage.getItem("name"),
      userType: localStorage.getItem("userType"),
      email: localStorage.getItem("email"),
    };

    if (token) {
      setAuthData({ user: userData });
    } else {
      setAuthData({ user: null });
    }

    setIsLoading(false);
  }, []);

  return { data: authData, isLoading };
};

export default useAuth;