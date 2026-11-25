import { normalizeAccents } from "../slug";
import { SITE_URL } from "../config";

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
  imageUrl?: string | null;
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
// Same families as the webshop (next/font: Outfit for display, Inter for text),
// with system fallbacks for clients that strip <style> (Gmail).
const DISPLAY = "'Outfit','Helvetica Neue',Helvetica,Arial,sans-serif";
const SANS = "'Inter','Helvetica Neue',Helvetica,Arial,sans-serif";
const WEBFONTS = `<style>
@font-face{font-family:'Inter';font-style:normal;font-weight:400;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa25L7W0Q5n-wU.woff2) format('woff2');unicode-range:U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF;}
@font-face{font-family:'Inter';font-style:normal;font-weight:400;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7W0Q5nw.woff2) format('woff2');unicode-range:U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;}
@font-face{font-family:'Inter';font-style:normal;font-weight:500;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa25L7W0Q5n-wU.woff2) format('woff2');unicode-range:U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF;}
@font-face{font-family:'Inter';font-style:normal;font-weight:500;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7W0Q5nw.woff2) format('woff2');unicode-range:U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;}
@font-face{font-family:'Outfit';font-style:normal;font-weight:400;font-display:swap;src:url(https://fonts.gstatic.com/s/outfit/v15/QGYvz_MVcBeNP4NJuktqUYLkn8BJ.woff2) format('woff2');unicode-range:U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF;}
@font-face{font-family:'Outfit';font-style:normal;font-weight:400;font-display:swap;src:url(https://fonts.gstatic.com/s/outfit/v15/QGYvz_MVcBeNP4NJtEtqUYLknw.woff2) format('woff2');unicode-range:U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;}
@font-face{font-family:'Outfit';font-style:normal;font-weight:500;font-display:swap;src:url(https://fonts.gstatic.com/s/outfit/v15/QGYvz_MVcBeNP4NJuktqUYLkn8BJ.woff2) format('woff2');unicode-range:U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF;}
@font-face{font-family:'Outfit';font-style:normal;font-weight:500;font-display:swap;src:url(https://fonts.gstatic.com/s/outfit/v15/QGYvz_MVcBeNP4NJtEtqUYLknw.woff2) format('woff2');unicode-range:U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;}
</style>`;

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function money(amount: number, currency: string): string {
  return new Intl.NumberFormat(currency === "HUF" ? "hu-HU" : "en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Amounts for the HTML part. A zero-width space between the digits and the
 * currency suffix stops iOS Mail's data detector from turning a price into a
 * tappable phone-number link. It is invisible and does not affect copy/paste
 * of the digits themselves.
 */
function moneyHtml(amount: number, currency: string): string {
  const formatted = money(amount, currency);
  return esc(formatted.replace(/([\d\u00a0\s])(\D+)$/u, "$1\u200B$2"));
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

// Common Hungarian surnames: buyers often type "Dénes András" (surname first),
// where the given name is the SECOND token. Kept short on purpose.
const HU_SURNAMES = new Set(
  [
    "dénes","kovács","nagy","tóth","szabó","horváth","varga","kiss","molnár","német","németh","farkas",
    "balogh","papp","takács","juhász","lakatos","mészáros","oláh","simon","rácz","fekete","szűcs",
    "török","fehér","balázs","gál","kis","szilágyi","kocsis","pintér","fodor","szalai","sipos","magyar",
    "lukács","gulyás","biró","király","lászló","katona","jakab","bogdán","sándor","vincze","deák",
    "somogyi","boros","fábián","vörös","fülöp","buda","szűts","barta","halász","máté","orbán","hegedűs",
    "bognár","székely","barna","lőrincz","antal","pásztor","bakos","váradi","sárközi","nemes","veres",
    "nemesházi","pethő","zsolnai","vida","lengyel","bodnár","ifjú","kerekes","torma","hajdu",
  ],
);

function firstName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return fullName.trim();
  const lower = parts[0].toLowerCase();
  if (lower === "unknown") return fullName.trim();
  if (parts.length > 1 && HU_SURNAMES.has(lower)) return parts[1];
  return parts[0];
}

// NB: filenameToSlug() strips what it takes for a file extension, so feeding it
// a title like "2020.01 Venice" truncates to "2020". Build the slug from the
// title directly, with the same normalisation rules the artwork page uses.
function titleToSlug(title: string): string {
  return normalizeAccents(title)
    .replace(/[.\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function siteBase(): string {
  return SITE_URL.replace(/\/+$/, "");
}

function artworkUrl(name: string): string {
  return `${siteBase()}/artwork/${titleToSlug(name)}`;
}

export function buildOrderConfirmationText(order: OrderEmailData): string {
  const lines: string[] = [];
  const totalQty = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const noun = totalQty === 1 ? "print" : "prints";
  const verb = totalQty === 1 ? "ships" : "ship";

  lines.push(`${firstName(order.customerName)}, thank you for your order.`);
  lines.push("");
  lines.push(`Order ${order.orderId}`);
  lines.push("");
  for (const item of order.items) {
    const size = item.size ? ` (${item.size})` : "";
    lines.push(`- ${item.name}${size} × ${item.quantity} — ${money(item.amount * item.quantity, order.currency)}`);
    lines.push(`  ${artworkUrl(item.name)}`);
  }
  lines.push("");
  lines.push(`Total: ${money(order.totalAmount, order.currency)}`);
  lines.push(`Your ${noun} ${verb} free of charge.`);
  const shipping = addressLines(order.shippingAddress);
  if (shipping.length) {
    lines.push("");
    lines.push("Shipping to:");
    lines.push(...shipping);
  }
  lines.push("");
  lines.push("Your invoice arrives in a separate email.");
  lines.push("");
  lines.push("YellowSky — fine art prints");
  lines.push(`contact@andrasdenes.com · ${SITE_URL.replace(/^https?:\/\//, "")}`);
  return lines.join("\n");
}

export function buildOrderConfirmationHtml(order: OrderEmailData): string {
  const totalQty = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const noun = totalQty === 1 ? "print" : "prints";
  const verb = totalQty === 1 ? "ships" : "ship";

  const rows = order.items
    .map((item, index) => {
      const url = artworkUrl(item.name);
      const last = index === order.items.length - 1;
      const bottom = last ? "transparent" : BORDER;
      return `
        <tr>
          ${
            item.imageUrl
              ? `<td width="94" style="padding:16px 14px 16px 0;vertical-align:top;">
                   <a href="${esc(url)}" style="text-decoration:none;"><img src="${esc(item.imageUrl)}" width="78" height="78" alt="${esc(item.name)}" style="display:block;width:78px;height:78px;object-fit:cover;border:1px solid ${BORDER};" /></a>
                 </td>`
              : ""
          }
          <td style="padding:16px 0;border-bottom:1px solid ${bottom};vertical-align:top;">
            <div style="font-family:${DISPLAY};font-size:17px;line-height:1.3;">
              <a href="${esc(url)}" style="color:${INK};text-decoration:none;">${esc(item.name)}</a>
            </div>
            <div style="font-family:${SANS};font-size:12px;line-height:1.6;color:${MUTED};padding-top:4px;">
              ${item.size ? `${esc(item.size)} &middot; ` : ""}Quantity ${item.quantity}
            </div>
            <div style="padding-top:7px;">
              <a href="${esc(url)}" style="font-family:${SANS};font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${INK};text-decoration:none;border-bottom:1px solid ${YELLOW};padding-bottom:1px;">View print</a>
            </div>
          </td>
          <td align="right" style="padding:16px 0;border-bottom:1px solid ${bottom};font-family:${SANS};font-size:15px;color:${INK};white-space:nowrap;vertical-align:top;">
            ${moneyHtml(item.amount * item.quantity, order.currency)}
          </td>
        </tr>`;
    })
    .join("");

  const addressCell = (title: string, lines: string[]) => `
    <td width="50%" style="padding:0 12px 0 0;vertical-align:top;">
      <div style="font-family:${SANS};font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:${INK};font-weight:700;padding-bottom:7px;">${title}</div>
      <div style="font-family:${SANS};font-size:13px;line-height:1.65;color:${MUTED};">${
        lines.length ? lines.map(esc).join("<br />") : "&mdash;"
      }</div>
    </td>`;

  const shipping = addressLines(order.shippingAddress);
  const billing = addressLines(order.billingAddress);
  const hasAddresses = shipping.length > 0 || billing.length > 0;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no" />
    <meta name="color-scheme" content="light" />
    ${WEBFONTS}
    <title>Order ${esc(order.orderId)} — YellowSky</title>
  </head>
  <body style="margin:0;padding:0;background:${CREAM};-webkit-font-smoothing:antialiased;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid ${BORDER};">
            <tr>
              <td style="padding:28px 32px 0 32px;">
                <div style="font-family:${SANS};font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:${INK};font-weight:700;">Yellowsky</div>
                <div style="height:3px;width:44px;background:${YELLOW};margin-top:10px;"></div>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 0 32px;font-family:${SANS};">
                <h1 style="margin:0;font-family:${DISPLAY};font-size:26px;line-height:1.25;color:${INK};font-weight:400;">Thank you for your order</h1>
                <p style="margin:10px 0 0 0;font-size:14px;line-height:1.65;color:${MUTED};">
                  ${esc(firstName(order.customerName))}, your ${noun} ${verb} free of charge.
                  Order <span style="color:${INK};">${esc(order.orderId)}</span>.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px 0 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:${SANS};">
                  ${rows}
                </table>
              </td>
            </tr>
            <tr>
              <td align="right" style="padding:22px 32px 0 32px;font-family:${SANS};">
                <span style="font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:${INK};font-weight:700;">Total</span>
                <span style="font-size:18px;color:${INK};font-weight:600;padding-left:12px;white-space:nowrap;">${moneyHtml(order.totalAmount, order.currency)}</span>
              </td>
            </tr>
            ${
              hasAddresses
                ? `<tr>
                     <td style="padding:26px 32px 0 32px;">
                       <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                         <tr>
                           ${addressCell("Shipping", shipping)}
                           ${addressCell("Billing", billing)}
                         </tr>
                       </table>
                     </td>
                   </tr>`
                : ""
            }
            <tr>
              <td style="padding:26px 32px 0 32px;"><div style="height:1px;background:${BORDER};"></div></td>
            </tr>
            <tr>
              <td style="padding:18px 32px 32px 32px;font-family:${SANS};">
                <p style="margin:0;font-size:13px;line-height:1.65;color:${MUTED};">
                  Your invoice arrives in a separate email.
                </p>
                <p style="margin:16px 0 0 0;font-size:12px;line-height:1.6;color:${MUTED};">
                  Questions? Reply to this email or write to
                  <a href="mailto:contact@andrasdenes.com" style="color:${INK};text-decoration:none;border-bottom:1px solid ${YELLOW};">contact@andrasdenes.com</a>.<br />
                  YellowSky — fine art prints · <a href="${siteBase()}" style="color:${MUTED};text-decoration:none;">${siteBase().replace(/^https?:\/\//, "")}</a>
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
