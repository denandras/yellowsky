"use client";

import { IconShoppingBag } from "@/components/icons";
import { useCart } from "@/lib/cart-context";
import { useState, useEffect } from "react";

type CartButtonProps = {
  onClick: () => void;
  labels: {
    ariaLabel: string;
  };
};

export default function CartButton({ onClick, labels }: CartButtonProps) {
  const { getItemCount } = useCart();
  const count = getItemCount();
  const [isAnimating, setIsAnimating] = useState(false);
  const [prevCount, setPrevCount] = useState(count);

  useEffect(() => {
    if (count > prevCount && prevCount >= 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timer);
    }
    setPrevCount(count);
  }, [count, prevCount]);

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex items-center justify-center rounded-lg p-2 transition-colors hover:bg-neutral-100"
      aria-label={labels.ariaLabel}
    >
      <IconShoppingBag className="size-6 text-text-dark" />
      {count > 0 && (
        <span
          className={`absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white ${
            isAnimating ? "animate-[popIn_0.6s_ease-out]" : ""
          }`}
        >
          {count > 9 ? "9+" : count}
        </span>
      )}
      {isAnimating && (
        <span
          className="pointer-events-none absolute -right-1 -top-1 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-white opacity-0"
          style={{
            animation: "popCircle 0.6s ease-out forwards",
          }}
        >
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  );
}