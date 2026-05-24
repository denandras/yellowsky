"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";

type ImageZoomModalProps = {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
};

export default function ImageZoomModal({ src, alt, isOpen, onClose }: ImageZoomModalProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [showControls, setShowControls] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Detect image dimensions
  useEffect(() => {
    if (!isOpen || !src) return;
    
    const img = new window.Image();
    img.onload = () => {
      setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = src;
  }, [isOpen, src]);

  // Reset on open, then show controls after delay
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPosition({ x: 50, y: 50 });
      setShowControls(false);
      const timer = setTimeout(() => setShowControls(true), 500);
      return () => clearTimeout(timer);
    } else {
      setShowControls(false);
    }
  }, [isOpen, src]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Keyboard handling
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "+" || e.key === "=") {
        setScale(s => Math.min(s + 0.5, 4));
      } else if (e.key === "-") {
        setScale(s => Math.max(s - 0.5, 1));
      } else if (e.key === "0") {
        setScale(1);
        setPosition({ x: 50, y: 50 });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Mouse wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    setScale(s => Math.max(1, Math.min(4, s + delta)));
  }, []);

  // Drag to pan (when zoomed)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  }, [scale]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;

    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    setPosition(prev => ({
      x: Math.max(0, Math.min(100, prev.x - dx * 0.1)),
      y: Math.max(0, Math.min(100, prev.y - dy * 0.1)),
    }));

    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isDragging, scale, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Double-click to toggle zoom
  const handleDoubleClick = useCallback(() => {
    setScale(s => s > 1 ? 1 : 2);
  }, []);

  // Touch handling for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1 && scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  }, [scale]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1 || scale <= 1) return;

    const dx = e.touches[0].clientX - dragStart.x;
    const dy = e.touches[0].clientY - dragStart.y;

    setPosition(prev => ({
      x: Math.max(0, Math.min(100, prev.x - dx * 0.1)),
      y: Math.max(0, Math.min(100, prev.y - dy * 0.1)),
    }));

    setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  }, [isDragging, scale, dragStart]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        // Only close if clicking the background, not the image
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Close button */}
      {showControls && (
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="fixed top-4 right-4 z-10 flex size-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-all hover:bg-white/20"
          aria-label="Close"
        >
          <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Zoom controls */}
      {showControls && (
        <div className="fixed bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/60 px-4 py-2 backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setScale(s => Math.max(1, s - 0.5))}
            disabled={scale <= 1}
            className="flex size-8 items-center justify-center rounded-full text-white transition-all hover:bg-white/20 disabled:opacity-30"
            aria-label="Zoom out"
          >
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
            </svg>
          </button>
          <span className="min-w-[3rem] text-center text-sm text-white">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale(s => Math.min(4, s + 0.5))}
            disabled={scale >= 4}
            className="flex size-8 items-center justify-center rounded-full text-white transition-all hover:bg-white/20 disabled:opacity-30"
            aria-label="Zoom in"
          >
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      )}

      {/* Image container */}
      <div
        ref={containerRef}
        className="relative h-full w-full overflow-hidden"
        style={{ cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in" }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: `scale(${scale}) translate(${50 - position.x}%, ${50 - position.y}%)`,
            transformOrigin: `${position.x}% ${position.y}%`,
            transition: isDragging ? "none" : "transform 0.2s ease-out",
          }}
        >
          <div
            style={imageDimensions ? { aspectRatio: `${imageDimensions.width}/${imageDimensions.height}` } : undefined}
          >
            <Image
              src={src}
              alt={alt}
              width={imageDimensions?.width ?? 1200}
              height={imageDimensions?.height ?? 1600}
              className="max-h-[90vh] max-w-[95vw] object-contain"
              priority
              unoptimized
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
            />
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}