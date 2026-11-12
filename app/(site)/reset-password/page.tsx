import type { Metadata } from "next";
import { ResetPasswordPageView } from "@/components/ResetPasswordForm";

export const metadata: Metadata = { title: "Reset Password", robots: { index: false, follow: false } };

export default function ResetPasswordPage() {
  return <ResetPasswordPageView />;
}
