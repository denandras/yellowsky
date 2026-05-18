import type { Metadata } from "next";
import ContactPageClient from "@/components/contact-page-client";

export const metadata: Metadata = {
  title: "Contact | Yellowsky",
  description: "Get in touch about prints, commissions, or collaborations.",
};

export default function ContactPage() {
  return <ContactPageClient />;
}