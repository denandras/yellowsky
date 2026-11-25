import type { Metadata } from "next";
import AdminPriceManager from "@/components/admin-price-manager";

export const metadata: Metadata = {
  title: "Prices — Yellowsky",
  robots: { index: false, follow: false },
};

export default function AdminPricesPage() {
  return (
    <main className="min-h-dvh bg-background-light">
      <div className="mx-auto flex max-w-md flex-col gap-8 px-6 py-16">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-text-dark">
            Print prices
          </h1>
          <p className="text-sm text-text-muted">
            Changing an amount reprices every artwork product in Stripe.
          </p>
        </header>
        <AdminPriceManager />
      </div>
    </main>
  );
}
