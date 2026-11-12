import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/server/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    redirect("/login?next=/admin");
  }

  return <AdminShell>{children}</AdminShell>;
}
