import type { Metadata } from "next";
import { RegisterPageView } from "@/components/RegisterForm";

export const metadata: Metadata = { title: "Create an Account" };

export default function RegisterPage() {
  return <RegisterPageView />;
}
