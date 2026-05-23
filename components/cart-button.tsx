"use client";

import { IconShoppingBag } from "@/components/icons";
import { useCart } from "@/lib/cart-context";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

type CartButtonProps = {
  onClick: () => void;
  labels: {
    ariaLabel: string;
  };
  /** When provided and cart is empty, clicking navigates here instead of opening cart */
  hrefWhenEmpty?: string;
};

export default function CartButton({ onClick, labels, hrefWhenEmpty }: CartButtonProps) {
  const { getItemCount } = useCart();
  const count = getItemCount();
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const prevCountRef = useRef(count);
  const shouldNavigateToWebshop = hrefWhenEmpty && count === 0;

  useEffect(() => {
    if (!hasLoaded) {
      setHasLoaded(true);
      prevCountRef.current = count;
      return;
    }
    if (count > prevCountRef.current) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 400);
      return () => clearTimeout(timer);
    }
    prevCountRef.current = count;
  }, [count, hasLoaded]);

  const handleClick = () => {
    if (count > 0) {
      onClick();
    }
    // If empty and hrefWhenEmpty provided, Link handles navigation
  };

  // When cart is empty and we have a href, wrap in Link
  if (shouldNavigateToWebshop) {
    return (
      <Link
        href={hrefWhenEmpty}
        className="relative flex items-center justify-center rounded-lg p-2 transition-colors active:scale-95 active:bg-neutral-100 cursor-pointer"
        aria-label={labels.ariaLabel}
      >
        <IconShoppingBag className="size-6 text-text-dark" />
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`relative flex items-center justify-center rounded-lg p-2 transition-colors active:scale-95 ${count > 0 ? 'hover:bg-neutral-100 cursor-pointer' : 'active:bg-neutral-100 cursor-default'}`}
      aria-label={labels.ariaLabel}
    >
      <IconShoppingBag className="size-6 text-text-dark" />
      {count > 0 && (
        <span
          className={`absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white ${
            isAnimating ? "animate-[popIn_0.4s_ease-out]" : ""
          }`}
        >
          {count > 9 ? "9+" : count}
        </span>
      )}
      {isAnimating && (
        <span
          className="pointer-events-none absolute flex items-center justify-center rounded-full bg-primary text-xs font-bold text-white"
          style={{
            width: "22px",
            height: "22px",
            right: "-4px",
            top: "-4px",
            animation: "popCircle 0.4s ease-out forwards",
          }}
        >
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  );
}