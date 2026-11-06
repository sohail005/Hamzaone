import { AccountSideNav } from "@/components/AccountSideNav";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[220px_1fr]">
        <AccountSideNav />
        <div>{children}</div>
      </div>
    </div>
  );
}
