import Link from "next/link";
import { IconHome, IconShoppingBag, IconSend } from "@/components/icons";

type BottomNavProps = {
  active: "home" | "webshop" | "contact";
};

const itemBase =
  "flex h-full items-center justify-center transition-colors";

export default function BottomNav({ active }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-border bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
      <div className="mx-auto grid h-16 w-full max-w-2xl grid-cols-3">
        <Link
          href="/contact"
          prefetch={true}
          className={`${itemBase} ${
            active === "contact"
              ? "text-primary"
              : "text-neutral-400 hover:text-primary"
          }`}
        >
          <IconSend className="size-5" />
        </Link>

        <Link
          href="/"
          prefetch={true}
          className={`${itemBase} ${
            active === "home"
              ? "text-primary"
              : "text-neutral-400 hover:text-primary"
          }`}
        >
          <IconHome className="size-5" />
        </Link>

        <Link
          href="/webshop"
          prefetch={true}
          className={`${itemBase} ${
            active === "webshop"
              ? "text-primary"
              : "text-neutral-400 hover:text-primary"
          }`}
        >
          <IconShoppingBag className="size-5" />
        </Link>
      </div>
    </nav>
  );
}