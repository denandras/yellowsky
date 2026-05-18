import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background-light px-6 text-text-dark">
      <div className="mb-6 h-16 w-16 rounded-full bg-primary" />
      <h1 className="font-display mb-2 text-4xl font-bold">404</h1>
      <p className="mb-8 text-text-muted">This page doesn&apos;t exist.</p>
      <Link
        href="/"
        className="rounded-xl border border-neutral-border bg-white px-6 py-3 font-display font-semibold transition-colors hover:border-primary/40 hover:bg-primary/5"
      >
        Go home
      </Link>
    </div>
  );
}