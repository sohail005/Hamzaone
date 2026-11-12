import type { Metadata } from "next";
import { LoginPageView } from "@/components/LoginForm";

export const metadata: Metadata = { title: "Sign In" };

export default function LoginPage() {
  return <LoginPageView />;
}
