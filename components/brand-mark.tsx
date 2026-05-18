export default function BrandMark({ size = 24 }: { size?: number }) {
  return (
    <div 
      className="rounded-full bg-primary" 
      style={{ height: size, width: size }}
      aria-label="Yellowsky logo" 
    />
  );
}