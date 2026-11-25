export type AddressLike = {
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
};

export type OrderEmailItem = {
  name: string;
  size?: string | null;
  quantity: number;
  amount: number; // major units (Ft), already divided by 100
  currency: string;
};

export type OrderEmailData = {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: OrderEmailItem[];
  totalAmount: number;
  currency: string;
  shippingAddress?: AddressLike | null;
  billingAddress?: AddressLike | null;
};

const YELLOW = "#ffcb2a";
const INK = "#1a1a1a";
const MUTED = "#666666";
const BORDER = "#e6e3dc";
const CREAM = "#f7f6f3";

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function money(amount: number, currency: string): string {
  const formatter = new Intl.NumberFormat(currency === "HUF" ? "hu-HU" : "en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });
  return formatter.format(amount);
}

function addressLines(address?: AddressLike | null): string[] {
  if (!address) return [];
  const lines: string[] = [];
  if (address.line1) lines.push(address.line1);
  if (address.line2) lines.push(address.line2);
  const cityLine = [address.postal_code, address.city].filter(Boolean).join(" ");
  if (cityLine) lines.push(cityLine);
  if (address.state) lines.push(address.state);
  if (address.country) lines.push(address.country);
  return lines;
}

export function buildOrderConfirmationText(order: OrderEmailData): string {
  const lines: string[] = [];
  lines.push(`Thank you for your order, ${order.customerName}.`);
  lines.push("");
  lines.push(`Order ${order.orderId}`);
  lines.push("");
  for (const item of order.items) {
    const size = item.size ? ` (${item.size})` : "";
    lines.push(`- ${item.name}${size} × ${item.quantity} — ${money(item.amount * item.quantity, order.currency)}`);
  }
  lines.push("");
  lines.push(`Total: ${money(order.totalAmount, order.currency)}`);
  lines.push("Shipping is free.");
  const shipping = addressLines(order.shippingAddress);
  if (shipping.length) {
    lines.push("");
    lines.push("Shipping to:");
    lines.push(...shipping);
  }
  lines.push("");
  lines.push("Your invoice (számla) arrives in a separate email.");
  lines.push("");
  lines.push("Yellowsky — fine art prints");
  lines.push("contact@andrasdenes.com · https://www.yellowsky.cc");
  return lines.join("\n");
}

export function buildOrderConfirmationHtml(order: OrderEmailData): string {
  const shipping = addressLines(order.shippingAddress);
  const billing = addressLines(order.billingAddress);

  const rows = order.items
    .map(
      (item, index) => `
        <tr>
          <td style="padding:14px 0;border-bottom:1px solid ${index === order.items.length - 1 ? "transparent" : BORDER};">
            <div style="font-size:15px;line-height:1.45;color:${INK};font-weight:500;">${esc(item.name)}</div>
            <div style="font-size:13px;line-height:1.5;color:${MUTED};">
              ${
                item.size
                  ? `${esc(item.size)} · `
                  : ""
              }Quantity ${item.quantity}
            </div>
          </td>
          <td align="right" style="padding:14px 0;border-bottom:1px solid ${
            index === order.items.length - 1 ? "transparent" : BORDER
          };font-size:15px;color:${INK};white-space:nowrap;vertical-align:top;">
            ${esc(money(item.amount * item.quantity, order.currency))}
          </td>
        </tr>`,
    )
    .join("");

  const addressBlock = (title: string, lines: string[]) =>
    lines.length === 0
      ? ""
      : `
      <tr>
        <td style="padding-top:26px;">
          <div style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${MUTED};padding-bottom:6px;">${title}</div>
          <div style="font-size:14px;line-height:1.6;color:${INK};">${lines.map(esc).join("<br />")}</div>
        </td>
      </tr>`;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <title>Order ${esc(order.orderId)}</title>
  </head>
  <body style="margin:0;padding:0;background:${CREAM};-webkit-font-smoothing:antialiased;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid ${BORDER};">
            <tr>
              <td style="padding:28px 32px 0 32px;">
                <div style="font-family:Helvetica,Arial,sans-serif;font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:${INK};font-weight:700;">Yellowsky</div>
                <div style="height:3px;width:44px;background:${YELLOW};margin-top:10px;"></div>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 0 32px;font-family:Helvetica,Arial,sans-serif;">
                <h1 style="margin:0;font-size:24px;line-height:1.25;color:${INK};font-weight:600;">Thank you for your order</h1>
                <p style="margin:10px 0 0 0;font-size:14px;line-height:1.65;color:${MUTED};">
                  ${esc(order.customerName)}, your print${order.items.length > 1 ? "s are" : " is"} on ${order.items.length > 1 ? "their" : "its"} way soon.
                  Order <span style="color:${INK};">${esc(order.orderId)}</span>.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px 0 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:Helvetica,Arial,sans-serif;">
                  ${rows}
                  <tr>
                    <td style="padding:16px 0 0 0;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${MUTED};">Total</td>
                    <td align="right" style="padding:16px 0 0 0;font-size:17px;color:${INK};font-weight:600;white-space:nowrap;">${esc(money(order.totalAmount, order.currency))}</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding:6px 0 0 0;font-size:13px;color:${MUTED};font-family:Helvetica,Arial,sans-serif;">Shipping is free.</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:Helvetica,Arial,sans-serif;">
                  ${addressBlock("Shipping to", shipping)}
                  ${addressBlock("Invoice address", billing)}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px 0 32px;">
                <div style="height:1px;background:${BORDER};"></div>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px 32px 32px;font-family:Helvetica,Arial,sans-serif;">
                <p style="margin:0;font-size:13px;line-height:1.65;color:${MUTED};">
                  Your invoice (számla) arrives in a separate email.
                </p>
                <p style="margin:16px 0 0 0;font-size:12px;line-height:1.6;color:${MUTED};">
                  Questions? Reply to this email or write to
                  <a href="mailto:contact@andrasdenes.com" style="color:${INK};text-decoration:none;border-bottom:1px solid ${YELLOW};">contact@andrasdenes.com</a>.<br />
                  Yellowsky — fine art prints · <a href="https://www.yellowsky.cc" style="color:${MUTED};text-decoration:none;">yellowsky.cc</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
