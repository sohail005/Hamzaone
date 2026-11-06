import { InfoSideNav } from "./InfoSideNav";

export function InfoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[220px_1fr]">
        <InfoSideNav />
        <div className="max-w-2xl">{children}</div>
      </div>
    </div>
  );
}
