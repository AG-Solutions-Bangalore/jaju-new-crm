import { Route, Routes, useNavigate } from "react-router-dom";

import { Toaster } from "./components/ui/toaster";

import SessionTimeoutTracker from "./components/SessionTimeoutTracker/SessionTimeoutTracker";
import DisabledRightClick from "./components/common/DisabledRightClick";

import AppRoutes from "./routes/AppRoutes";
import Cookies from "js-cookie";

function App() {
  const navigate = useNavigate();
  const time = Cookies.get("token-expire-time");
  const handleLogout = () => {
 
    navigate("/");
  };
  return (
    <>
      {/* <DisabledRightClick /> */}
      <Toaster />
      {/* <SessionTimeoutTracker expiryTime={time} onLogout={handleLogout} /> */}
      <AppRoutes />
    </>
  );
}

export default App;
