import { Breadcrumbs } from "@/components/new/breadcrumbs";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

const DesktopHeader = ({ onBack }) => {
  return (
    <header className="hidden sm:flex flex-row justify-between h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1 hover:bg-blue-100" />
        <Separator orientation="vertical" className="mr-2 h-4 inline-block" />
        <Breadcrumbs onBack={onBack} />
      </div>
    </header>
  );
};

export default DesktopHeader;
