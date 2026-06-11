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

  const otherLang = language === "hu" ? "EN" : "HU";
  const otherLangValue = language === "hu" ? "en" : "hu";

  return (
    <button
      type="button"
      onClick={() => setAndRefresh(otherLangValue)}
      className={`font-display text-sm font-semibold tracking-wide transition-colors ${
        light
          ? "text-white/80 hover:text-white"
          : "text-text-dark hover:text-primary"
      }`}
    >
      {otherLang}
    </button>
  );
}