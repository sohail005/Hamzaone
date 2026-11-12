import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/server/auth";
import { AccountSideNav } from "@/components/AccountSideNav";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/account");
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[220px_1fr]">
        <AccountSideNav />
        <div>{children}</div>
      </div>
    </div>
  );
}
