import { Wrench } from "lucide-react";

export default function MaintenancePage() {
  return (
    <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-4 px-4 py-24 text-center sm:px-6">
      <Wrench className="h-12 w-12 text-accent-text" />
      <h1 className="text-2xl font-bold">We'll be back shortly</h1>
      <p className="max-w-md text-sm text-text-muted">
        HamzaOne is undergoing scheduled maintenance. We expect to be back online shortly — thanks for your patience.
      </p>
    </div>
  );
}
