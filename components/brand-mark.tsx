export default function BrandMark({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <div
      className={`rounded-full bg-primary ${className}`}
      style={{ height: size, width: size }}
      aria-label="Yellowsky logo"
    />
  );
}