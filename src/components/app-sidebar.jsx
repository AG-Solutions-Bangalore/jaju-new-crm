import * as React from "react";
import {
  AudioWaveform,
  BadgeIndianRupee,
  Blocks,
  Command,
  File,
  Frame,
  GalleryVerticalEnd,
  Map,
  NotebookText,
  Package,
  ReceiptText,
  Settings,
  Settings2,
  ShoppingBag,
  TicketPlus,
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
        icon: Frame,
        isActive: false,
      },
      // {
      //   title: "Master",
      //   url: "#",
      //   isActive: false,
      //   icon: Settings2,
      //   items: [
      //     {
      //       title: "Category",
      //       url: "/master/category",
      //     },
      //     {
      //       title: "Item",
      //       url: "/master/item",
      //     },
      //     {
      //       title: "Buyer",
      //       url: "/master/buyer",
      //     },
      //   ],
      // },
      {
        title: "Estimate",
        url: "/estimate",
        icon: ShoppingBag,
        isActive: false,
      },
      {
        title: "Day Book",
        url: "/day-book",
        icon: ShoppingBag,
        isActive: false,
      },
      {
        title: "Ledger",
        url: "/ledger",
        icon: Package,
        isActive: false,
      },
      {
        title: "Trial Balance",
        url: "/trial-balance",
        icon: Package,
        isActive: false,
      },
      {
        title: "Product",
        url: "/product",
        icon: Package,
        isActive: false,
      },
      {
        title: "Purchase Granite",
        url: "/purchase-granite",
        icon: Package,
        isActive: false,
      },
      {
        title: "Purchase Tiles",
        url: "/Purchase-tiles",
        icon: Package,
        isActive: false,
      },
      {
        title: "Sales",
        url: "/sales",
        icon: Package,
        isActive: false,
      },
      {
        title: "Stocks",
        url: "/stocks",
        icon: Package,
        isActive: false,
      },
      // {
      //   title: "Report",
      //   url: "#",
      //   isActive: false,
      //   icon: File,
      //   items: [
      //     {
      //       title: "Stock",
      //       url: "/report/stock",
      //     },
      //     {
      //       title: "Buyer",
      //       url: "/report/buyer",
      //     },
      //     {
      //       title: "Single Item Stock",
      //       url: "/report/single-item-stock",
      //     },
      //   ],
      // },
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
