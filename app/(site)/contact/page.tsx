import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with HamzaOne for order support or custom print questions.",
};

export default function ContactPage() {
  return <ContactForm />;
}
