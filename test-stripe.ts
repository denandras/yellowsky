import Stripe from "stripe";

async function main() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error("Missing STRIPE_SECRET_KEY");
    process.exit(1);
  }

  const stripe = new Stripe(secretKey, {
    apiVersion: "2026-04-22.dahlia",
  });

  console.log("Fetching Stripe products...\n");

  const products = await stripe.products.list({ active: true, limit: 100 });
  
  for (const product of products.data) {
    const prices = await stripe.prices.list({ product: product.id, active: true, limit: 10 });
    console.log(`Product: ${product.name} (${product.id})`);
    console.log(`  Images: ${product.images.length > 0 ? product.images.join(", ") : "none"}`);
    console.log(`  Prices: ${prices.data.map(p => `${p.nickname || "unnamed"}: ${((p.unit_amount || 0) / 100).toLocaleString()} ${p.currency.toUpperCase()}`).join(", ")}`);
    console.log("");
  }

  console.log(`Total: ${products.data.length} products`);
}

main().catch(console.error);