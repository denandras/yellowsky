"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useRef } from "react";
import {
  DEFAULT_SITE_LANGUAGE,
  normalizeSiteLanguage,
  SITE_LANGUAGE_COOKIE,
  type SiteLanguage,
} from "@/lib/site-language";

const SITE_LANGUAGE_STORAGE_KEY = "site-language";
const SITE_LANGUAGE_EVENT = "site-language-change";

function readCookieLanguage(): SiteLanguage | null {
  if (typeof document === "undefined") return null;
  const entries = document.cookie.split(";").map((part) => part.trim());
  const hit = entries.find((entry) => entry.startsWith(`${SITE_LANGUAGE_COOKIE}=`));
  if (!hit) return null;
  const value = decodeURIComponent(hit.split("=").slice(1).join("="));
  return normalizeSiteLanguage(value);
}

function persistLanguage(next: SiteLanguage) {
  localStorage.setItem(SITE_LANGUAGE_STORAGE_KEY, next);
  document.cookie = `${SITE_LANGUAGE_COOKIE}=${next}; path=/; max-age=31536000; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent(SITE_LANGUAGE_EVENT, { detail: next }));
}

export function useSiteLanguage(initialLanguage?: SiteLanguage) {
  const [language, setLanguage] = useState<SiteLanguage>(() => {
    // Server-rendered initialLanguage is the source of truth
    if (initialLanguage) return normalizeSiteLanguage(initialLanguage);
    return DEFAULT_SITE_LANGUAGE;
  });

  // Track if we've completed initial hydration
  const didHydrate = useRef(false);

  // Sync from storage ONLY after hydration (prevents mismatch)
  useEffect(() => {
    const fromStorage = window.localStorage.getItem(SITE_LANGUAGE_STORAGE_KEY);
    const fromCookie = readCookieLanguage();
    const stored = normalizeSiteLanguage(fromStorage ?? fromCookie ?? DEFAULT_SITE_LANGUAGE);
    
    // If user had a stored preference different from server, use that
    if (stored !== language) {
      setLanguage(stored);
    }
    didHydrate.current = true;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist when language changes (but not on initial mount)
  useEffect(() => {
    if (!didHydrate.current) return;
    persistLanguage(language);
  }, [language]);

  // Listen for changes from other components/tabs
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== SITE_LANGUAGE_STORAGE_KEY) return;
      setLanguage(normalizeSiteLanguage(event.newValue));
    };

    const onCustom = (event: Event) => {
      const detail = (event as CustomEvent<SiteLanguage>).detail;
      setLanguage(normalizeSiteLanguage(detail));
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener(SITE_LANGUAGE_EVENT, onCustom as EventListener);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(SITE_LANGUAGE_EVENT, onCustom as EventListener);
    };
  }, []);

  const api = useMemo(() => ({
    language,
    setLanguage: (next: SiteLanguage) => {
      setLanguage(normalizeSiteLanguage(next));
    },
  }), [language]);

  return api;
}

export default function LanguageSwitcher({
  initialLanguage,
  light = false,
}: {
  initialLanguage?: SiteLanguage;
  light?: boolean;
}) {
  const router = useRouter();
  const { language, setLanguage } = useSiteLanguage(initialLanguage);
  const isChangingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setAndRefresh = (next: SiteLanguage) => {
    if (next === language) return;
    if (isChangingRef.current) return;

    isChangingRef.current = true;
    setLanguage(next);

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce refresh and reset changing flag
    timeoutRef.current = setTimeout(() => {
      router.refresh();
      isChangingRef.current = false;
    }, 100);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-bold tracking-wider ${
        light
          ? "bg-white/10 text-white"
          : "bg-neutral-100 text-text-dark"
      }`}
    >
      <button
        type="button"
        disabled={language === "hu"}
        onClick={() => setAndRefresh("hu")}
        className={`px-1.5 py-0.5 transition-opacity ${
          language === "hu"
            ? "cursor-default font-semibold"
            : "cursor-pointer opacity-60 hover:opacity-100"
        }`}
      >
        HU
      </button>
      <span className={`px-1 ${light ? "text-white/50" : "text-text-muted"}`}>|</span>
      <button
        type="button"
        disabled={language === "en"}
        onClick={() => setAndRefresh("en")}
        className={`px-1.5 py-0.5 transition-opacity ${
          language === "en"
            ? "cursor-default font-semibold"
            : "cursor-pointer opacity-60 hover:opacity-100"
        }`}
      >
        EN
      </button>
    </div>
  );
}