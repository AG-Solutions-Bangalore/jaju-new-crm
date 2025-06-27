import Cookies from "js-cookie";
import { useEffect, useState } from "react";

const useAuth = () => {
  const [authData, setAuthData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get("token");
    const userData = {
      id: Cookies.get("id"),
      name: Cookies.get("name"),
      userType: Cookies.get("userType"),
      email: Cookies.get("email"),
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