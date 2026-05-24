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
  const [hasDragged, setHasDragged] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [showControls, setShowControls] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

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
      setHasDragged(false);
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
      setHasDragged(false);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  }, [scale]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;

    // Mark as dragged if moved more than 5px
    const dx = Math.abs(e.clientX - dragStart.x);
    const dy = Math.abs(e.clientY - dragStart.y);
    if (dx > 5 || dy > 5) {
      setHasDragged(true);
    }

    setPosition(prev => {
      const newX = prev.x - (e.clientX - dragStart.x) * 0.05;
      const newY = prev.y - (e.clientY - dragStart.y) * 0.05;
      return {
        x: Math.max(0, Math.min(100, newX)),
        y: Math.max(0, Math.min(100, newY)),
      };
    });

    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isDragging, scale, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Click on image: zoom in at click position, or reset if already zoomed
  const handleImageClick = useCallback((e: React.MouseEvent) => {
    // Don't zoom if we just dragged
    if (hasDragged) {
      setHasDragged(false);
      return;
    }

    if (scale === 1) {
      // Zoom in to 2x at click position
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setPosition({ x, y });
      setScale(2);
    } else {
      // Zoom out - keep current position (don't jump to center)
      setScale(1);
    }
  }, [scale, hasDragged]);

  // Click on backdrop: close modal
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    // Only close if clicking the backdrop itself (not the image container)
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // Prevent double-click from selecting text
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  // Touch handling for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1 && scale > 1) {
      setIsDragging(true);
      setHasDragged(false);
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  }, [scale]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1 || scale <= 1) return;

    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - dragStart.x);
    const dy = Math.abs(touch.clientY - dragStart.y);
    if (dx > 5 || dy > 5) {
      setHasDragged(true);
    }

    setPosition(prev => ({
      x: Math.max(0, Math.min(100, prev.x - (touch.clientX - dragStart.x) * 0.05)),
      y: Math.max(0, Math.min(100, prev.y - (touch.clientY - dragStart.y) * 0.05)),
    }));

    setDragStart({ x: touch.clientX, y: touch.clientY });
  }, [isDragging, scale, dragStart]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm animate-fadeIn"
      onClick={handleBackdropClick}
      onDoubleClick={handleDoubleClick}
    >
      {/* Close button */}
      {showControls && (
        <button
          onClick={onClose}
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
        <div className="fixed bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/60 px-4 py-2 backdrop-blur-sm">
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

      {/* Centered image container - pointer-events-none so clicks pass through to backdrop */}
      <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
        <div
          ref={imageRef}
          className="relative select-none pointer-events-auto"
          style={{
            cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in",
            transform: `scale(${scale})`,
            transformOrigin: `${position.x}% ${position.y}%`,
            transition: isDragging ? "none" : "transform 0.2s ease-out",
          }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div onClick={handleImageClick}
>
            <Image
              src={src}
              alt={alt}
              width={imageDimensions?.width ?? 1200}
              height={imageDimensions?.height ?? 1600}
              className="max-h-[90vh] max-w-[95vw] h-auto w-auto object-contain"
              style={{ width: 'auto', height: 'auto' }}
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