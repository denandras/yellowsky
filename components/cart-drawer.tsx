"use client";

import { useCart } from "@/lib/cart-context";
import { IconShoppingBag, IconX, IconTrash } from "@/components/icons";
import { useState, useEffect } from "react";

type CartDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
  labels: {
    title: string;
    empty: string;
    remove: string;
    clearCart: string;
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
  const { items, removeItem, updateQuantity, clearCart, getTotal } = useCart();
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  // Handle open/close with animations
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Small delay to trigger animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    } else {
      setIsVisible(false);
      // Wait for animation to complete before unmounting
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <>
      {/* Backdrop - fade in/out */}
      <div
        className={`fixed inset-0 z-[80] bg-black/40 backdrop-blur-[4px] transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Drawer - slide in/out from right */}
      <div className={`fixed right-0 top-0 z-[90] h-full w-full max-w-sm overflow-hidden transition-transform duration-300 ease-out ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Glass panel wrapper */}
        <div className="relative h-full">
          {/* Glass overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-black/22 to-black/15 backdrop-blur-xl" />
          {/* Specular highlight - left edge only */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 border-l border-white/20" />
            <div className="absolute inset-0 shadow-[inset_1px_0_2px_rgba(255,255,255,0.2),inset_-1px_0_1px_rgba(255,255,255,0.08)]" />
          </div>

          {/* Content wrapper */}
          <div className="relative h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="font-display text-lg font-bold text-white">{labels.title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full size-8 flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <IconX className="size-4 text-white/80" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {items.length === 0 ? (
                <div className="flex flex-1 items-center justify-center h-full">
                  <div className="text-center">
                    <IconShoppingBag className="mx-auto mb-3 size-12 text-white/30" />
                    <p className="text-white/50">{labels.empty}</p>
                  </div>
                </div>
              ) : (
                <ul className="h-full overflow-y-auto p-4 space-y-3">
                  {items.map((item) => (
                    <li
                      key={item.id}
                      className="flex gap-3 rounded-xl bg-white/5 p-3 border border-white/10"
                    >
                      {/* Thumbnail */}
                      <img
                        src={item.viewUrl}
                        alt={item.productTitle}
                        className="h-20 w-20 shrink-0 rounded-lg object-cover"
                      />
                      {/* Details */}
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <h3 className="font-display text-sm font-medium text-white">{item.productTitle}</h3>
                          <p className="text-xs text-white/50">{item.size}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, (item.quantity ?? 1) - 1)}
                              className="flex size-6 items-center justify-center rounded-md bg-white/10 text-sm text-white/80 hover:bg-white/20 transition-colors"
                            >
                              −
                            </button>
                            <span className="w-6 text-center text-sm text-white">{item.quantity ?? 1}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, (item.quantity ?? 1) + 1)}
                              className="flex size-6 items-center justify-center rounded-md bg-white/10 text-sm text-white/80 hover:bg-white/20 transition-colors"
                            >
                              +
                            </button>
                          </div>
                          <p className="font-display text-sm font-semibold text-yellow-400">
                            {formatPrice(item.price * (item.quantity ?? 1), item.currency)}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-4 border-t border-white/10">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm text-white/50">{labels.total}</span>
                  <span className="font-display text-lg font-bold text-white">
                    {formatPrice(getTotal(), items[0]?.currency || "EUR")}
                  </span>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => clearCart()}
                    className="flex items-center justify-center rounded-xl size-11 bg-white/10 hover:bg-white/20 transition-colors"
                    aria-label={labels.clearCart}
                  >
                    <IconTrash className="size-4 text-white/80" />
                  </button>
                  <button
                    type="button"
                    onClick={onCheckout}
                    disabled={loading}
                    className="flex-1 rounded-xl bg-yellow-400 py-3 text-center font-display font-semibold text-neutral-900 transition-colors hover:bg-yellow-300 disabled:opacity-50"
                  >
                    {loading ? labels.loading : labels.checkout}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}