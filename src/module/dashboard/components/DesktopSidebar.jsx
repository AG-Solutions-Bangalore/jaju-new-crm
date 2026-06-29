import { AppSidebar } from "@/components/app-sidebar";

const DesktopSidebar = () => {
  return (
    <div className="hidden md:block">
      <AppSidebar />
    </div>
  );
};

export default DesktopSidebar;
