"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-admin-bg">
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className="flex-1">
        <AdminTopbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
