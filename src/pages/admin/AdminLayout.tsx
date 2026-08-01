import { Outlet, Link } from "react-router-dom";
import { LogOut, ExternalLink } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { NotificationBell } from "@/components/admin/NotificationBell";
import { supabase } from "@/integrations/supabase/client";

const AdminLayout = () => (
  <AdminGuard>
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <AdminSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border bg-background/95 px-3 backdrop-blur">
            <SidebarTrigger />
            <Link to="/admin" className="font-display text-lg">
              Noble Spaces <span className="text-gold">Admin</span>
            </Link>
            <div className="ml-auto flex items-center gap-1">
              <NotificationBell />
              <Button asChild variant="ghost" size="sm">
                <a href="/" target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-1.5 h-4 w-4" /> View site
                </a>
              </Button>
              <Button variant="outline" size="sm" onClick={() => supabase.auth.signOut()}>
                <LogOut className="mr-1.5 h-4 w-4" /> Sign out
              </Button>
            </div>
          </header>
          <main className="min-w-0 flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  </AdminGuard>
);

export default AdminLayout;
