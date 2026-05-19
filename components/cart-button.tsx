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
      const timer = setTimeout(() => setIsAnimating(false), 500);
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
            isAnimating ? "animate-[popIn_0.5s_ease-out]" : ""
          }`}
        >
          {count > 9 ? "9+" : count}
        </span>
      )}
      {isAnimating && (
        <span
          className="pointer-events-none absolute flex items-center justify-center rounded-full bg-primary text-sm font-bold text-white"
          style={{
            width: "28px",
            height: "28px",
            right: "-6px",
            top: "-6px",
            animation: "popCircle 0.5s ease-out forwards",
          }}
        >
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  );
}