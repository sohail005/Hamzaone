import type { Metadata } from "next";
import { ForgotPasswordPageView } from "@/components/ForgotPasswordForm";

export const metadata: Metadata = { title: "Forgot Password" };

export default function ForgotPasswordPage() {
  return <ForgotPasswordPageView />;
}
