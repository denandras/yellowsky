"use client";

import { IconShoppingBag } from "@/components/icons";
import { useCart } from "@/lib/cart-context";

type CartButtonProps = {
  onClick: () => void;
  labels: {
    ariaLabel: string;
  };
};

export default function CartButton({ onClick, labels }: CartButtonProps) {
  const { getItemCount } = useCart();
  const count = getItemCount();

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex items-center justify-center rounded-lg p-2 transition-colors hover:bg-neutral-100"
      aria-label={labels.ariaLabel}
    >
      <IconShoppingBag className="size-6 text-text-dark" />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  );
}