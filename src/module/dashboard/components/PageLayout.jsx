import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Cookies from "js-cookie";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ChangePassword from "@/module/auth/components/ChangePassword";
import DesktopSidebar from "./DesktopSidebar";
import DesktopHeader from "./DesktopHeader";
import MobileHeader from "./MobileHeader";
import MobileBottomNav from "./MobileBottomNav";

// eslint-disable-next-line react/prop-types
export default function PageLayout({ children }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const nameL = Cookies.get("name");
  const emailL = Cookies.get("email");

  const handleBackClick = (e) => {
    e.preventDefault();
    navigate(-1);
  };

  const handleLogout = () => {
    ["token", "id", "name", "userType", "email"].forEach((cookie) => {
      Cookies.remove(cookie);
    });
    localStorage.clear();
    navigate("/");
  };

  const initialsChar = (nameL || "")
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();

  return (
    <SidebarProvider>
      <DesktopSidebar />

      <SidebarInset>
        <DesktopHeader onBack={handleBackClick} />

        <MobileHeader
          name={nameL}
          email={emailL}
          initials={initialsChar}
          onOpenChangePassword={() => setOpen(true)}
          onLogout={handleLogout}
        />

        <div className="flex flex-1 flex-col gap-4 p-0 md:p-4 pt-0">
          <div className="min-h-[calc(100vh-8rem)] md:min-h-[100vh] flex-1 rounded-xl p-2 pb-16 md:pb-2">
            {children}
          </div>
        </div>

        <MobileBottomNav />
        <ChangePassword setOpen={setOpen} open={open} />
      </SidebarInset>
    </SidebarProvider>
  );
}
