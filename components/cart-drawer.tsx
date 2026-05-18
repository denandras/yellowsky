"use client";

import { useCart } from "@/lib/cart-context";
import { IconShoppingBag, IconX } from "@/components/icons";
import { useState } from "react";

type CartDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
  labels: {
    title: string;
    empty: string;
    remove: string;
    checkout: string;
    total: string;
    loading: string;
  };
  loading: boolean;
};

function formatPrice(amount: number, currency: string): string {
  const formatter = new Intl.NumberFormat("hu-HU", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return formatter.format(amount / 100);
}

export default function CartDrawer({
  isOpen,
  onClose,
  onCheckout,
  labels,
  loading,
}: CartDrawerProps) {
  const { items, removeItem, getTotal } = useCart();

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[80] bg-black/30 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 z-[90] h-full w-full max-w-sm transform bg-white shadow-xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-border p-4">
          <h2 className="font-display text-lg font-bold">{labels.title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 transition-colors hover:bg-neutral-100"
            aria-label="Close"
          >
            <IconX className="size-5 text-text-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="flex h-[calc(100%-8rem)] flex-col overflow-hidden">
          {items.length === 0 ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <IconShoppingBag className="mx-auto mb-3 size-12 text-neutral-200" />
                <p className="text-text-muted">{labels.empty}</p>
              </div>
            </div>
          ) : (
            <ul className="flex-1 overflow-y-auto p-4">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="mb-4 flex gap-3 rounded-lg border border-neutral-border p-3"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.viewUrl}
                    alt={item.productTitle}
                    className="h-20 w-20 shrink-0 rounded-md object-cover"
                  />
                  {/* Details */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h3 className="font-display text-sm font-medium">{item.productTitle}</h3>
                      <p className="text-xs text-text-muted">{item.size}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="font-display text-sm font-semibold text-primary">
                        {formatPrice(item.price, item.currency)}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-xs text-text-muted hover:text-text-dark"
                      >
                        {labels.remove}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 border-t border-neutral-border bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-text-muted">{labels.total}</span>
              <span className="font-display text-lg font-bold">
                {formatPrice(getTotal(), items[0]?.currency || "EUR")}
              </span>
            </div>
            <button
              type="button"
              onClick={onCheckout}
              disabled={loading}
              className="w-full rounded-xl bg-primary py-3 text-center font-display font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? labels.loading : labels.checkout}
            </button>
          </div>
        )}
      </div>
    </>
  );
}