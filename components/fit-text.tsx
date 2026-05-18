"use client";

import { useLayoutEffect, useRef, useState } from "react";

type FitTextProps = {
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  children: string;
  className?: string;
  minFontPx?: number;
  maxFontPx?: number;
};

export default function FitText({
  as = "span",
  children,
  className = "",
  minFontPx = 12,
  maxFontPx = 64,
}: FitTextProps) {
  const Tag = as;
  const elementRef = useRef<HTMLElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const [fontSize, setFontSize] = useState(maxFontPx);

  useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const fit = () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }

      frameRef.current = window.requestAnimationFrame(() => {
        const node = elementRef.current;
        if (!node) return;

        const roundedMax = Math.max(minFontPx, maxFontPx);
        let low = minFontPx;
        let high = roundedMax;

        node.style.fontSize = `${roundedMax}px`;
        if (node.scrollWidth <= node.clientWidth) {
          setFontSize(roundedMax);
          return;
        }

        for (let step = 0; step < 10; step += 1) {
          const mid = (low + high) / 2;
          node.style.fontSize = `${mid}px`;

          if (node.scrollWidth <= node.clientWidth) {
            low = mid;
          } else {
            high = mid;
          }
        }

        setFontSize(Math.max(minFontPx, Math.floor(low * 100) / 100));
      });
    };

    fit();

    const observer = new ResizeObserver(() => fit());
    observer.observe(element);
    if (element.parentElement) {
      observer.observe(element.parentElement);
    }

    return () => {
      observer.disconnect();
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [children, minFontPx, maxFontPx]);

  return (
    <Tag
      ref={(node) => {
        elementRef.current = node as HTMLElement | null;
      }}
      className={className}
      style={{ fontSize: `${fontSize}px`, whiteSpace: "nowrap" }}
    >
      {children}
    </Tag>
  );
}