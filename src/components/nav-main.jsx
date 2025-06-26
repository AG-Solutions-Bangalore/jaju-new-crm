import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import React from "react";

const itemVariants = {
  open: { opacity: 1, height: "auto", transition: { duration: 0.3 } },
  closed: { opacity: 0, height: 0, transition: { duration: 0.3 } },
};

const buttonVariants = {
  hover: { scale: 1.05 },
};

export function NavMain({ items }) {
  const location = useLocation();
  
  const handleLinkClick = (e) => {
    const sidebarContent = document.querySelector(".sidebar-content");
    if (sidebarContent) {
      sessionStorage.setItem("sidebarScrollPosition", sidebarContent.scrollTop);
    }
  };

  React.useEffect(() => {
    const sidebarContent = document.querySelector(".sidebar-content");
    const scrollPosition = sessionStorage.getItem("sidebarScrollPosition");

    if (sidebarContent && scrollPosition) {
      sidebarContent.scrollTop = parseInt(scrollPosition);
    }
  }, [location.pathname]);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Home</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const hasSubItems = item.items && item.items.length > 0;
          const isParentActive = hasSubItems 
            ? item.items.some(subItem => location.pathname.startsWith(subItem.url))
            : location.pathname.startsWith(item.url);

          if (!hasSubItems) {
            return (
              <SidebarMenuItem key={item.title}>
                <Link to={item.url} onClick={handleLinkClick}>
                  <motion.div variants={buttonVariants} whileHover="hover">
                    <SidebarMenuButton 
                      tooltip={item.title}
                      className={`rounded-md transition-colors duration-200 ${
                        location.pathname.startsWith(item.url)
                          ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      {item.icon && <item.icon className="w-5 h-5" />}
                      <span className="ml-2">
                        {item.title}
                      </span>
                    </SidebarMenuButton>
                  </motion.div>
                </Link>
              </SidebarMenuItem>
            );
          }

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={isParentActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <motion.div variants={buttonVariants} whileHover="hover">
                    <SidebarMenuButton 
                      tooltip={item.title}
                      className={`rounded-md transition-colors duration-200 ${
                        isParentActive
                          ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      {item.icon && <item.icon className="w-5 h-5" />}
                      <span className="ml-2">
                        {item.title}
                      </span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </motion.div>
                </CollapsibleTrigger>
                <CollapsibleContent
                  as={motion.div}
                  variants={itemVariants}
                  initial="closed"
                  animate={isParentActive ? "open" : "closed"}
                >
                  <SidebarMenuSub className="border-l border-blue-200 dark:border-blue-800 ml-4 pl-2">
                    {item.items?.map((subItem) => {
                      const isSubItemActive = location.pathname.startsWith(subItem.url);
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <Link to={subItem.url} onClick={handleLinkClick}>
                              <motion.div 
                                whileHover={{ scale: 1.05 }}
                                className={`px-3 py-2 rounded-md transition-colors duration-200 ${
                                  isSubItemActive
                                    ? "bg-blue-100 text-blue-600 w-full  rounded-xl dark:bg-blue-900 dark:text-blue-200"
                                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                                }`}
                              >
                                {subItem.title}
                              </motion.div>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}