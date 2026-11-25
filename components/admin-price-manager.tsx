"use client";

import { FormEvent, useEffect, useState } from "react";

type Prices = { a4: number; a3: number; updatedAt: string | null };

type Backfill = {
  checkedProducts: number;
  created: number;
  replaced: number;
  deactivated: number;
  untouched: number;
  errors: Array<{ name: string; error: string }>;
};

const ft = (filler: number) => (filler / 100).toLocaleString("hu-HU");

export default function AdminPriceManager() {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [saved, setSaved] = useState<Prices | null>(null);
  const [a4, setA4] = useState("");
  const [a3, setA3] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Backfill | null>(null);

  useEffect(() => {
    fetch("/api/admin/prices", { cache: "no-store" })
      .then(async (r) => {
        if (r.ok) {
          const d = (await r.json()) as Prices;
          applyPrices(d);
          setAuthed(true);
        }
      })
      .finally(() => setChecking(false));
  }, []);

  function applyPrices(p: Prices) {
    setSaved(p);
    setA4(String(p.a4 / 100));
    setA3(String(p.a3 / 100));
  }

  async function login(e: FormEvent) {
    e.preventDefault();
    setLoginError("");
    const res = await fetch("/api/admin/prices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setLoginError("Wrong password.");
      return;
    }
    const d = (await res.json()) as Prices;
    applyPrices(d);
    setPassword("");
    setAuthed(true);
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    const a4f = Math.round(Number(a4.replace(",", ".")) * 100);
    const a3f = Math.round(Number(a3.replace(",", ".")) * 100);
    if (!Number.isFinite(a4f) || !Number.isFinite(a3f) || a4f <= 0 || a3f <= 0) {
      setError("Both prices must be positive amounts in Ft.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/prices", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ a4: a4f, a3: a3f }),
      });
      const d = await res.json();
      if (!res.ok) {
        setError(d.error || "Save failed.");
        return;
      }
      applyPrices(d.saved as Prices);
      setResult(d.backfill as Backfill);
    } catch {
      setError("Network error - nothing was saved.");
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/prices", { method: "DELETE" });
    setAuthed(false);
    setResult(null);
  }

  const box = "w-full max-w-md";

  if (checking) {
    return (
      <div className={`${box} text-sm text-text-muted`}>Checking session…</div>
    );
  }

  if (!authed) {
    return (
      <form onSubmit={login} className={`${box} space-y-4`}>
        <div>
          <label htmlFor="pw" className="block text-sm text-text-muted mb-2">
            Password
          </label>
          <input
            id="pw"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="w-full rounded-lg border border-neutral-border bg-white px-4 py-3 text-base outline-none focus:border-text-dark"
          />
        </div>
        {loginError && <p className="text-sm text-red-600">{loginError}</p>}
        <button
          type="submit"
          className="w-full rounded-lg bg-primary px-4 py-3 text-base font-medium text-text-dark transition-opacity hover:opacity-90"
        >
          Unlock prices
        </button>
      </form>
    );
  }

  return (
    <div className={`${box} space-y-6`}>
      <form onSubmit={save} className="space-y-5">
        <div>
          <label htmlFor="a4" className="block text-sm text-text-muted mb-2">
            A4 price (Ft)
          </label>
          <input
            id="a4"
            inputMode="decimal"
            value={a4}
            onChange={(e) => setA4(e.target.value)}
            className="w-full rounded-lg border border-neutral-border bg-white px-4 py-3 text-lg tabular-nums outline-none focus:border-text-dark"
          />
        </div>
        <div>
          <label htmlFor="a3" className="block text-sm text-text-muted mb-2">
            A3 price (Ft)
          </label>
          <input
            id="a3"
            inputMode="decimal"
            value={a3}
            onChange={(e) => setA3(e.target.value)}
            className="w-full rounded-lg border border-neutral-border bg-white px-4 py-3 text-lg tabular-nums outline-none focus:border-text-dark"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-primary px-4 py-3 text-base font-medium text-text-dark transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving and updating artworks…" : "Save prices"}
        </button>
      </form>

      {result && (
        <div className="rounded-lg border border-neutral-border bg-white p-4 text-sm">
          <p className="font-medium mb-2">Saved.</p>
          <ul className="space-y-1 text-text-muted tabular-nums">
            <li>Artworks checked: {result.checkedProducts}</li>
            <li>Prices replaced: {result.replaced}</li>
            <li>Prices created: {result.created}</li>
            <li>Old prices retired: {result.deactivated}</li>
            <li>Already correct: {result.untouched}</li>
          </ul>
          {result.errors.length > 0 && (
            <ul className="mt-2 space-y-1 text-red-600">
              {result.errors.slice(0, 5).map((e) => (
                <li key={e.name}>
                  {e.name}: {e.error}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-text-muted">
        <span>
          {saved?.updatedAt
            ? `Last saved ${new Date(saved.updatedAt).toLocaleString("hu-HU")}`
            : "Currently the built-in defaults"}
        </span>
        <button type="button" onClick={logout} className="underline underline-offset-2">
          Lock
        </button>
      </div>

      {saved && (
        <p className="text-xs text-text-muted">
          Active: A4 {ft(saved.a4)} Ft · A3 {ft(saved.a3)} Ft. The webshop shows new
          prices within 10 minutes.
        </p>
      )}
    </div>
  );
}
