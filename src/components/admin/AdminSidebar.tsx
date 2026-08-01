import { NavLink, useLocation } from "react-router-dom";
import {
  Bell,
  CalendarCheck,
  FileText,
  Image,
  LayoutDashboard,
  MessageSquare,
  Package,
  Quote,
  Receipt,
  Settings,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

type Item = { title: string; url: string; icon: typeof LayoutDashboard };

const GROUPS: { label: string; items: Item[] }[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
      { title: "Notifications", url: "/admin/notifications", icon: Bell },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Bookings", url: "/admin/bookings", icon: CalendarCheck },
      { title: "Orders", url: "/admin/orders", icon: Receipt },
      { title: "Quotations", url: "/admin/quotes", icon: Quote },
      { title: "Messages", url: "/admin/messages", icon: MessageSquare },
    ],
  },
  {
    label: "Catalogue",
    items: [
      { title: "Services", url: "/admin/services", icon: Sparkles },
      { title: "Service photos", url: "/admin/photos", icon: Image },
    ],
  },
  {
    label: "Content",
    items: [{ title: "Testimonials", url: "/admin/testimonials", icon: Star }],
  },
];

export const AdminSidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active =
                    item.url === "/admin" ? pathname === "/admin" : pathname.startsWith(item.url);
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                        <NavLink to={item.url} end={item.url === "/admin"} className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
};
