import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripeSecretKey } from "@/lib/stripe-config";
import { sendOrderConfirmation } from "@/lib/email";
import { artworkImageUrl } from "@/lib/artwork-image-url";
import { ART_LINE_DESCRIPTION, createOrderInvoice } from "@/lib/tacito";

export const dynamic = "force-dynamic";
// Invoice creation + issue + e-mail runs inside this request; give it room.
export const maxDuration = 60;

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
    // Both addresses matter: the invoice needs the BILLING address
    // (customer_details.address), fulfilment needs the SHIPPING one, which Stripe
    // Checkout collects via shipping_address_collection and exposes under
    // collected_information.shipping_details on current API versions.
    const billingAddress = session.customer_details?.address ?? undefined;
    const shippingAddress =
      session.collected_information?.shipping_details?.address ?? billingAddress;

    // Format order details for notification
    const items = lineItems.data.map((item) => {
      const product = item.price?.product as Stripe.Product;
      return {
        name: product?.name || item.description || "Unknown product",
        size: item.price?.nickname || null,
        imageUrl: artworkImageUrl(product?.metadata?.filename),
        quantity: item.quantity || 1,
        amount: item.amount_total ? item.amount_total / 100 : 0,
        currency: item.currency?.toUpperCase() || "EUR",
      };
    });

    const totalAmount = session.amount_total ? session.amount_total / 100 : 0;
    const currency = session.currency?.toUpperCase() || "EUR";

    // --- Live-order guards -------------------------------------------------
    // 1. Only confirm orders that are actually paid. With delayed payment methods
    //    checkout.session.completed arrives while payment_status is still
    //    "unpaid"; the confirmation must wait for async_payment_succeeded.
    if (session.payment_status !== "paid") {
      console.log("Order not paid yet, no confirmation sent:", session.id, session.payment_status);
      return;
    }
    // 2. Exactly once. Stripe retries webhooks and can deliver both
    //    completed and async_payment_succeeded for the same session, so the
    //    session itself carries the marker.
    const alreadySent = session.metadata?.confirmation_email_sent === "1";
    const hasEmail = Boolean(customerEmail && customerEmail !== "unknown");

    // Customer confirmation email (cc the owner). Never throws: a mail failure must
    // not turn a paid order into a webhook error that Stripe retries forever.
    if (hasEmail && !alreadySent) {
      const mailResult = await sendOrderConfirmation({
        orderId: session.id,
        customerName,
        customerEmail,
        items,
        totalAmount,
        currency,
        shippingAddress,
        billingAddress,
      });
      if (mailResult.ok) {
        await stripe.checkout.sessions
          .update(session.id, { metadata: { confirmation_email_sent: "1" } })
          .catch((err) => console.error("Could not mark confirmation sent:", session.id, err));
      } else {
        console.error("Order confirmation email not sent:", session.id, mailResult.error);
      }
    } else if (!hasEmail) {
      console.error("Order has no customer email, confirmation skipped:", session.id);
    }

    // --- Invoice (TACITo -> NAV) -------------------------------------------
    // Real paid orders get a real számla. Exactly once: the session carries the
    // invoice id once it exists, and the Idempotency-Key is derived from the
    // session, so a Stripe retry cannot number a second invoice.
    if (!session.metadata?.tacito_invoice_id && items.length > 0) {
      const invoiceLines = items.map((item) => ({
        description: ART_LINE_DESCRIPTION,
        quantity: item.quantity,
        unit: "DB",
        unitPriceGross: item.quantity > 0 ? item.amount / item.quantity : item.amount,
        vatRate: "AAM",
      }));
      const titles = items.map((item) => item.name);
      const note =
        (titles.length === 1 ? titles[0] : titles.map((t, i) => `${i + 1}. ${t}`).join("\n")) +
        `\nRendelés: ys:${session.id}`;

      const invoiceResult = await createOrderInvoice({
        orderId: `ys:${session.id}`,
        buyer: {
          name: customerName,
          email: customerEmail === "unknown" ? null : customerEmail,
          countryCode: billingAddress?.country ?? "HU",
          postalCode: billingAddress?.postal_code ?? null,
          city: billingAddress?.city ?? null,
          address: [billingAddress?.line1, billingAddress?.line2].filter(Boolean).join(" ") || null,
        },
        lines: invoiceLines,
        note,
      });

      if (invoiceResult.ok) {
        await stripe.checkout.sessions
          .update(session.id, {
            metadata: {
              tacito_invoice_id: invoiceResult.id,
              tacito_invoice_number: invoiceResult.number ?? "",
              tacito_state: invoiceResult.state,
              tacito_nav: invoiceResult.navOutcome ?? "",
            },
          })
          .catch((err) => console.error("Could not store invoice id:", session.id, err));
      } else if (invoiceResult.skipped) {
        console.warn("Invoice skipped:", session.id, invoiceResult.error);
      } else {
        console.error("INVOICE FAILED:", session.id, invoiceResult.error);
        await postDiscordAlert(
          `Invoice failed for paid order \`${session.id}\` (${totalAmount} ${currency}). Stripe took the money, TACITo did not invoice.\n${invoiceResult.error}`,
        );
        await stripe.checkout.sessions
          .update(session.id, { metadata: { tacito_error: invoiceResult.error.slice(0, 450) } })
          .catch(() => undefined);
      }
    }

    // Send Discord notification (once per order)
    if (session.metadata?.order_notified !== "1") {
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
      await stripe.checkout.sessions
        .update(session.id, { metadata: { order_notified: "1" } })
        .catch(() => undefined);
    }

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

/** Plain-text Discord alert for failures that need a human. Best effort. */
async function postDiscordAlert(content: string): Promise<void> {
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
  } catch (error) {
    console.error("Discord alert failed:", error);
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