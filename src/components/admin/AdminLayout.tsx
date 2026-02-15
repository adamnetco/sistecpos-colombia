import { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { RoleSwitcherBar } from "@/components/shared/RoleSwitcherBar";

export function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full">
      <AdminSidebar />
      <main className="flex-1 bg-muted/30 p-4 pt-14 md:p-6 md:pt-6 md:pl-6">
        <AdminHeader />
        <RoleSwitcherBar />
        {children}
      </main>
    </div>
  );
}
