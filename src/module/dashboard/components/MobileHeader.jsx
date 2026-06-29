import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Key, LogOut } from "lucide-react";

const MobileHeader = ({ name, email, initials, onOpenChangePassword, onLogout }) => {
  return (
    <div className="sm:hidden sticky top-0 flex justify-between items-center px-4 py-2 border-b z-40 bg-white rounded-b-lg shadow-sm">
      <div className="font-semibold flex items-center space-x-2">
        <span>JAJU-CRM</span>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center justify-center relative">
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
            <Avatar className="h-8 w-8 border-2 border-blue-300 rounded-lg shadow-sm">
              <AvatarImage src="/avatars/shadcn.jpg" alt={name} />
              <AvatarFallback className="rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 text-black font-bold text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-56 rounded-xl border border-blue-200 shadow-lg"
          side="bottom"
          align="end"
          sideOffset={4}
        >
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 p-3 text-left text-sm bg-blue-50 rounded-t-xl">
              <Avatar className="h-10 w-10 rounded-full border-2 border-blue-300">
                <AvatarImage src="/avatars/shadcn.jpg" alt={name} />
                <AvatarFallback className="rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-black font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-blue-900">
                  {name}
                </span>
                <span className="truncate text-xs text-blue-700">
                  {email}
                </span>
                <span className="text-xs text-green-600 font-medium mt-0.5 flex items-center">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
                  Online
                </span>
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator className="bg-blue-200" />
          <DropdownMenuItem
            className="hover:bg-blue-100 focus:bg-blue-100 rounded-md my-0.5 mx-1"
            onClick={onOpenChangePassword}
          >
            <Key className="mr-2 h-4 w-4 text-blue-700" />
            <span className="cursor-pointer">Change Password</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="hover:bg-blue-100 focus:bg-blue-100 rounded-md my-0.5 mx-1"
            onClick={onLogout}
          >
            <LogOut className="mr-2 h-4 w-4 text-blue-700" />
            <span className="cursor-pointer">Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default MobileHeader;
