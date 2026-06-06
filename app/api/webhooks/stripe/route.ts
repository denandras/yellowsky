import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripeSecretKey } from "@/lib/stripe-config";

export const dynamic = "force-dynamic";

// Webhook secret from Stripe CLI (local) or Dashboard (production)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  const secretKey = getStripeSecretKey();
  if (!secretKey) {
    console.error("Stripe not configured");
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  if (!webhookSecret) {
    console.error("Missing STRIPE_WEBHOOK_SECRET");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const stripe = new Stripe(secretKey, {
    apiVersion: "2026-04-22.dahlia",
  });

  // Get raw body - CRITICAL for signature verification
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json(
      { error: `Signature verification failed: ${message}` },
      { status: 400 }
    );
  }

  // Handle events
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleSuccessfulOrder(session, stripe, "completed");
      break;
    }

    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleSuccessfulOrder(session, stripe, "async_payment_succeeded");
      break;
    }

    case "checkout.session.async_payment_failed": {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleFailedPayment(session, stripe);
      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("Checkout expired:", session.id);
      // Optionally notify about abandoned carts
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      console.log("Invoice paid:", invoice.id);
      // For subscription invoices - you may want to handle differently
      break;
    }

    default:
      // Log unhandled events but don't error
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

async function handleSuccessfulOrder(
  session: Stripe.Checkout.Session,
  stripe: Stripe,
  eventType: string = "completed"
) {
  try {
    // Get line items with product details
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      expand: ["data.price.product"],
    });

    // Extract order details
    const customerEmail = session.customer_details?.email || session.customer_email || "unknown";
    const customerName = session.customer_details?.name || "Unknown";
    const shippingAddress = session.customer_details?.address ?? undefined;

    // Format order details for notification
    const items = lineItems.data.map((item) => {
      const product = item.price?.product as Stripe.Product;
      return {
        name: product?.name || item.description || "Unknown product",
        quantity: item.quantity || 1,
        amount: item.amount_total ? item.amount_total / 100 : 0,
        currency: item.currency?.toUpperCase() || "EUR",
      };
    });

    const totalAmount = session.amount_total ? session.amount_total / 100 : 0;
    const currency = session.currency?.toUpperCase() || "EUR";

    // Send Discord notification
    await sendDiscordNotification({
      customerEmail,
      customerName,
      items,
      totalAmount,
      currency,
      shippingAddress,
      sessionId: session.id,
      eventType,
    });

  } catch (error) {
    console.error("Error handling successful order:", error);
    // Don't throw - webhook should return 200 to prevent Stripe retries
  }
}

async function handleFailedPayment(
  session: Stripe.Checkout.Session,
  stripe: Stripe
) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.error("DISCORD_WEBHOOK_URL not configured");
    return;
  }
  
  const customerEmail = session.customer_details?.email || session.customer_email || "unknown";
  const totalAmount = session.amount_total ? session.amount_total / 100 : 0;
  const currency = session.currency?.toUpperCase() || "EUR";
  
  const payload = {
    content: "⚠️ **Payment Failed**",
    embeds: [
      {
        title: "Failed Payment",
        color: 15158332, // Red
        fields: [
          {
            name: "Customer Email",
            value: customerEmail,
          },
          {
            name: "Amount",
            value: `${totalAmount} ${currency}`,
          },
          {
            name: "Session ID",
            value: `\`${session.id}\``,
          },
        ],
        timestamp: new Date().toISOString(),
      },
    ],
  };
  
  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("Failed to send Discord notification:", error);
  }
}

interface OrderNotification {
  customerEmail: string;
  customerName: string;
  items: Array<{ name: string; quantity: number; amount: number; currency: string }>;
  totalAmount: number;
  currency: string;
  shippingAddress?: Stripe.Address;
  sessionId: string;
  eventType?: string;
}

async function sendDiscordNotification(order: OrderNotification) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.error("DISCORD_WEBHOOK_URL not configured");
    return;
  }
  
  const eventType = order.eventType || "completed";
  const eventLabel = eventType === "async_payment_succeeded" ? "(async)" : "";
  
  // Format shipping address
  const address = order.shippingAddress;
  const addressStr = address
    ? [
        address.line1,
        address.line2,
        address.city,
        address.postal_code,
        address.country,
      ]
        .filter(Boolean)
        .join(", ")
    : "No shipping address";
  
  // Format items
  const itemsStr = order.items
    .map((item) => `• **${item.name}** x${item.quantity} = ${item.amount} ${item.currency}`)
    .join("\n");
  
  const payload = {
    content: `🎨 **New Order Received!** ${eventLabel}`,
    embeds: [
      {
        title: "Order Details",
        color: 5174599, // Yellowsky brand color (gold-ish)
        fields: [
          {
            name: "Customer",
            value: `${order.customerName}\n${order.customerEmail}`,
            inline: true,
          },
          {
            name: "Total",
            value: `${order.totalAmount} ${order.currency}`,
            inline: true,
          },
          {
            name: "Items",
            value: itemsStr,
          },
          {
            name: "Shipping Address",
            value: addressStr,
          },
          {
            name: "Session ID",
            value: `\`${order.sessionId}\``,
          },
        ],
        timestamp: new Date().toISOString(),
      },
    ],
  };
  
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      console.error("Discord webhook failed:", response.status, await response.text());
    }
  } catch (error) {
    console.error("Failed to send Discord notification:", error);
  }
}