"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { IconShoppingBag, IconX } from "@/components/icons";
import { filenameToSlug } from "@/lib/slug";

type MediaItem = {
  id: string;
  title: string;
  alt: string;
  viewUrl: string;
  downloadUrl: string;
  productId?: string;
  productName?: string;
  prices?: Array<{ id: string; nickname?: string; unitAmount?: number; currency: string }>;
  hasProduct: boolean;
};

type ImageGalleryProps = {
  items: MediaItem[];
  labels: {
    buyPrint: string;
    loading: string;
    freeShipping: string;
    addToCart: string;
    comingSoon: string;
    selectSize: string;
  };
  onAddToCart: (item: MediaItem, priceId: string) => void;
  cartLoading: Record<string, boolean>;
};

function ImageCard({
  item,
  index,
  labels,
  isVisible,
  onAddToCart,
  cartLoading,
  isActive,
  setActiveItem,
  closeItem,
  selectedPrice,
  setSelectedPrice,
}: {
  item: MediaItem;
  index: number;
  labels: ImageGalleryProps["labels"];
  isVisible: boolean;
  onAddToCart: ImageGalleryProps["onAddToCart"];
  cartLoading: Record<string, boolean>;
  isActive: boolean;
  setActiveItem: (id: string | null) => void;
  closeItem: () => void;
  selectedPrice: Record<string, string>;
  setSelectedPrice: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const hasSelectedSize = !!selectedPrice[item.id];
  const slug = filenameToSlug(item.title + ".png"); // title is already without extension

  return (
    <div
      className="overflow-hidden rounded-xl border border-neutral-border bg-white relative group"
      data-item-id={item.id}
      style={{
        opacity: loaded ? 1 : 0,
        transform: loaded ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.4s ease-out, transform 0.4s ease-out",
        transitionDelay: loaded ? `${Math.min(index * 30, 300)}ms` : "0ms",
      }}
    >
      {/* Skeleton placeholder */}
      {!loaded && !error && (
        <div className="w-full aspect-[4/3] bg-neutral-100 animate-pulse" />
      )}

      {/* Error state */}
      {error && (
        <div className="w-full aspect-[4/3] bg-neutral-100 flex items-center justify-center">
          <p className="text-sm text-text-muted">Image unavailable</p>
        </div>
      )}

      {/* Image - clickable link to artwork page */}
      <Link href={`/artwork/${slug}`} className="block relative aspect-[4/3] overflow-hidden rounded-lg">
        <img
          src={item.viewUrl}
          alt={item.alt}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02] cursor-pointer"
          loading={index < 6 ? "eager" : "lazy"}
          fetchPriority={index < 3 ? "high" : "low"}
          decoding={index < 6 ? "sync" : "async"}
          onLoad={() => setLoaded(true)}
          onError={() => { setLoaded(true); setError(true); }}
          style={{ opacity: loaded && !error ? 1 : 0, transition: "opacity 0.3s ease-out" }}
        />
      </Link>

      {/* Basket button - separate from clickable area */}
      {item.hasProduct && item.prices && item.prices.length > 0 && !error && (
        <button
          type="button"
          data-cart-toggle
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setActiveItem(isActive ? null : item.id);
          }}
          className="absolute bottom-3 right-3 flex size-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-md transition-all hover:bg-white hover:scale-105 z-10"
          aria-label={labels.buyPrint}
        >
          <IconShoppingBag className="size-4 text-text-dark" />
        </button>
      )}

      {/* Coming soon badge */}
      {!item.hasProduct && loaded && !error && (
        <div className="absolute bottom-3 right-3 rounded-full bg-white/90 backdrop-blur-sm shadow-md px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-xs text-text-muted">{labels.comingSoon}</p>
        </div>
      )}

      {/* Price overlay */}
      {item.hasProduct && item.prices && item.prices.length > 0 && (
        <div
          data-overlay
          className={`absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-md p-4 shadow-lg transition-all duration-300 ease-out ${
            isActive ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="font-display text-sm font-medium text-text-dark">{item.title}</h3>
            <button type="button" onClick={closeItem} className="flex size-6 shrink-0 items-center justify-center rounded-full bg-neutral-100 transition-all hover:bg-neutral-200" aria-label="Close">
              <IconX className="size-3" />
            </button>
          </div>

          <div className="flex gap-2 mb-3">
            {[...item.prices].sort((a, b) => {
              // A4 first, then A3, then alphabetical for any other sizes
              const order = { 'A4': 1, 'A3': 2 };
              const aOrder = order[a.nickname as keyof typeof order] ?? 99;
              const bOrder = order[b.nickname as keyof typeof order] ?? 99;
              if (aOrder !== bOrder) return aOrder - bOrder;
              return (a.nickname || '').localeCompare(b.nickname || '');
            }).map((price) => {
              const isSelected = selectedPrice[item.id] === price.id;
              const isLoading = cartLoading[item.id] && isSelected;
              return (
                <button
                  key={price.id}
                  type="button"
                  onClick={() => setSelectedPrice((prev) => ({ ...prev, [item.id]: price.id }))}
                  disabled={isLoading}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-all ${
                    isSelected ? "border-primary bg-primary/5 text-text-dark font-medium" : "border-neutral-border bg-white text-text-muted hover:border-primary/50"
                  } ${isLoading ? "opacity-50 cursor-wait" : ""}`}
                >
                  {price.nickname} • {price.unitAmount ? `${(price.unitAmount / 100).toLocaleString("hu-HU")} ${price.currency.toUpperCase()}` : "N/A"}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => {
              if (selectedPrice[item.id]) {
                onAddToCart(item, selectedPrice[item.id]);
              }
            }}
            disabled={!hasSelectedSize || cartLoading[item.id]}
            className={`w-full rounded-lg py-2.5 text-sm font-medium transition-all ${
              hasSelectedSize && !cartLoading[item.id] ? "bg-text-dark text-white hover:bg-text-dark/90" : "bg-neutral-200 text-text-muted cursor-not-allowed"
            }`}
          >
            {cartLoading[item.id] ? labels.loading : labels.addToCart}
          </button>
        </div>
      )}
    </div>
  );
}

export default function ImageGallery({ items, labels, onAddToCart, cartLoading }: ImageGalleryProps) {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<Record<string, string>>({});
  const [columnCount, setColumnCount] = useState(3);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate columns based on viewport
  useEffect(() => {
    const updateColumns = () => {
      if (typeof window === "undefined") return;
      if (window.innerWidth < 640) setColumnCount(1);
      else if (window.innerWidth < 1024) setColumnCount(2);
      else setColumnCount(3);
    };
    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (activeItem) {
        const target = e.target as HTMLElement;
        if (!target.closest("[data-cart-toggle]") && !target.closest("[data-overlay]")) {
          setActiveItem(null);
        }
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [activeItem]);

  // Default price for single-price items
  useEffect(() => {
    const defaults: Record<string, string> = {};
    items.forEach((item) => {
      if (item.prices?.length === 1 && item.prices[0].id) {
        defaults[item.id] = item.prices[0].id;
      }
    });
    setSelectedPrice((prev) => ({ ...defaults, ...prev }));
  }, [items]);

  const closeItem = useCallback(() => setActiveItem(null), []);

  // Balanced column distribution
  const columnItems = useMemo(() => {
    const columns: MediaItem[][] = Array.from({ length: columnCount }, () => []);
    const heights = Array(columnCount).fill(0);
    items.forEach((item) => {
      const shortest = heights.indexOf(Math.min(...heights));
      columns[shortest].push(item);
      heights[shortest] += 1;
    });
    return columns;
  }, [items, columnCount]);

  return (
    <div ref={containerRef} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}>
      {columnItems.map((colItems, colIndex) => (
        <div key={colIndex} className="flex flex-col gap-4">
          {colItems.map((item) => {
            const globalIndex = items.indexOf(item);
            return (
              <ImageCard
                key={item.id}
                item={item}
                index={globalIndex}
                labels={labels}
                isVisible={true}
                onAddToCart={onAddToCart}
                cartLoading={cartLoading}
                isActive={activeItem === item.id}
                setActiveItem={setActiveItem}
                closeItem={closeItem}
                selectedPrice={selectedPrice}
                setSelectedPrice={setSelectedPrice}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}