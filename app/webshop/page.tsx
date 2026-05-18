import type { Metadata } from "next";
import WebshopPageClient from "@/components/webshop-page-client";

export const metadata: Metadata = {
  title: "Webshop | Yellowsky",
  description: "Purchase yellow sketches and prints by András Dénes.",
};

export default function WebshopPage() {
  return <WebshopPageClient />;
}