import * as React from "react";
import {
  AudioWaveform,
  
  Command,

  GalleryVerticalEnd,

  LayoutDashboard,  
    FileText,        
    BookOpen,       
    Book,          
    Scale,            
    Box,            
    Mountain,        
    SquareStack,     
    ShoppingCart,    
    Warehouse,  
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavMainUser } from "./nav-main-user";

export function AppSidebar({ ...props }) {
  const nameL = localStorage.getItem("name");
  const emailL = localStorage.getItem("email");

  // const initialData = {
  //   user: {
  //     name: `${nameL}`,
  //     email: `${emailL}`,
  //     avatar: "/avatars/shadcn.jpg",
  //   },
  //   teams: [
  //     {
  //       name: `Jaju Flooring`,
  //       logo: GalleryVerticalEnd,
  //       plan: "",
  //     },
  //     {
  //       name: "Acme Corp.",
  //       logo: AudioWaveform,
  //       plan: "Startup",
  //     },
  //     {
  //       name: "Evil Corp.",
  //       logo: Command,
  //       plan: "Free",
  //     },
  //   ],
  //   navMain: [
  //     {
  //       title: "Dashboard",
  //       url: "/home",
  //       icon: Frame,
  //       isActive: false,
  //     },
     
     
  //     {
  //       title: "Day Book",
  //       url: "/day-book",
  //       icon: ShoppingBag,
  //       isActive: false,
  //     },
  //     {
  //       title: "Ledger",
  //       url: "/ledger",
  //       icon: Package,
  //       isActive: false,
  //     },
  //     {
  //       title: "Trial Balance",
  //       url: "/trial-balance",
  //       icon: Package,
  //       isActive: false,
  //     },
    
     
  //   ],
  // };
  const initialData = {
    user: {
      name: `${nameL}`,
      email: `${emailL}`,
      avatar: "/avatars/shadcn.jpg",
    },
    teams: [
      {
        name: `Jaju Flooring`,
        logo: GalleryVerticalEnd,
        plan: "",
      },
      {
        name: "Acme Corp.",
        logo: AudioWaveform,
        plan: "Startup",
      },
      {
        name: "Evil Corp.",
        logo: Command,
        plan: "Free",
      },
    ],
    navMain: [
      {
        title: "Dashboard",
        url: "/home",
        icon: LayoutDashboard,
        isActive: false,
      },
     
      {
        title: "Estimate",
        url: "/estimate",
        icon: FileText,
        isActive: false,
      },
      {
        title: "Day Book",
        url: "/day-book",
        icon: BookOpen,
        isActive: false,
      },
      {
        title: "Ledger",
        url: "/ledger",
        icon: Book,
        isActive: false,
      },
      {
        title: "Trial Balance",
        url: "/trial-balance",
        icon: Scale,
        isActive: false,
      },
      {
        title: "Product",
        url: "/product",
        icon: Box,
        isActive: false,
      },
      {
        title: "Purchase Granite",
        url: "/purchase-granite",
        icon: Mountain,
        isActive: false,
      },
      {
        title: "Purchase Tiles",
        url: "/purchase-tiles",
        icon: SquareStack,
        isActive: false,
      },
      {
        title: "Sales",
        url: "/sales",
        icon: ShoppingCart,
        isActive: false,
      },
      {
        title: "Stocks",
        url: "/stocks",
        icon: Warehouse,
        isActive: false,
      },
     
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={initialData.teams} />
      </SidebarHeader>
      <SidebarContent className="sidebar-content">
        {/* <NavProjects projects={data.projects} /> */}
        <NavMain items={initialData.navMain} />
        <NavMainUser projects={initialData.userManagement} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={initialData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
