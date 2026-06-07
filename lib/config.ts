/**
 * Site configuration
 * Uses NEXT_PUBLIC_SITE_URL env var, falls back to yellowsky.cc
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://yellowsky.cc';
export const SITE_DOMAIN = new URL(SITE_URL).hostname;

// Author info
export const AUTHOR_NAME = 'András Dénes';
export const AUTHOR_URL = 'https://andrasdenes.com';
export const AUTHOR_EMAIL = 'contact@andrasdenes.com';