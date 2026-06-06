import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Test endpoint to verify webhook logic without Stripe signature verification
// DELETE THIS FILE AFTER TESTING

export async function POST(req: NextRequest) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    return NextResponse.json({ error: "DISCORD_WEBHOOK_URL not configured" }, { status: 500 });
  }

  try {
    const body = await req.json();

    // Simulate order details
    const testOrder = {
      customerEmail: "test@example.com",
      customerName: "Test Customer",
      items: [
        { name: "Test Artwork Print", quantity: 1, amount: 50, currency: "EUR" }
      ],
      totalAmount: 50,
      currency: "EUR",
      shippingAddress: {
        line1: "123 Test Street",
        city: "Budapest",
        postal_code: "1234",
        country: "HU"
      },
      sessionId: "cs_test_" + Math.random().toString(36).substr(2, 9),
    };

    // Format shipping address
    const address = testOrder.shippingAddress;
    const addressStr = `${address.line1}, ${address.city}, ${address.postal_code}, ${address.country}`;

    // Format items
    const itemsStr = testOrder.items
      .map((item) => `• **${item.name}** x${item.quantity} = ${item.amount} ${item.currency}`)
      .join("\n");

    const payload = {
      content: "🎨 **New Order Received!** (TEST)",
      embeds: [
        {
          title: "Order Details",
          color: 5174599,
          fields: [
            {
              name: "Customer",
              value: `${testOrder.customerName}\n${testOrder.customerEmail}`,
              inline: true,
            },
            {
              name: "Total",
              value: `${testOrder.totalAmount} ${testOrder.currency}`,
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
              value: `\`${testOrder.sessionId}\``,
            },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Discord webhook failed:", response.status, errorText);
      return NextResponse.json(
        { error: "Discord webhook failed", status: response.status, details: errorText },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Test notification sent to Discord #monitoring",
      order: testOrder
    });
  } catch (error) {
    console.error("Test webhook error:", error);
    return NextResponse.json(
      { error: "Test webhook failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}