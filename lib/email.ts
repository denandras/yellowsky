import nodemailer, { type Transporter } from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import {
  buildOrderConfirmationHtml,
  buildOrderConfirmationText,
  type OrderEmailData,
} from "./email-templates/order-confirmation";

/**
 * Outbound mail for the shop.
 *
 * Sends through Purelymail SMTP with the contact@andrasdenes.com mailbox.
 * Env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM, ORDER_CC.
 * If any of the first four is missing, sendOrderEmail() returns a skipped
 * result instead of throwing - a missing mailer must never break a paid order.
 */

let cached: Transporter | null = null;

function config() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.MAIL_FROM || "Yellowsky <contact@andrasdenes.com>";
  const cc = process.env.ORDER_CC || "contact@andrasdenes.com";
  if (!host || !user || !pass) return null;
  return { host, port, user, pass, from, cc };
}

function transporter(cfg: { host: string; port: number; user: string; pass: string }): Transporter {
  if (!cached) {
    const options: SMTPTransport.Options = {
      host: cfg.host,
      port: cfg.port,
      secure: cfg.port === 465,
      auth: { user: cfg.user, pass: cfg.pass },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    };
    cached = nodemailer.createTransport(options);
  }
  return cached;
}

export type SendResult = { ok: boolean; skipped?: boolean; messageId?: string; error?: string };

export async function sendOrderConfirmation(order: OrderEmailData): Promise<SendResult> {
  const cfg = config();
  if (!cfg) {
    console.warn("email: SMTP not configured, skipping order confirmation", order.orderId);
    return { ok: false, skipped: true, error: "SMTP not configured" };
  }
  try {
    const info = await transporter(cfg).sendMail({
      from: cfg.from,
      to: order.customerEmail,
      cc: cfg.cc,
      replyTo: cfg.cc,
      subject: `Order ${order.orderId} — YellowSky`,
      text: buildOrderConfirmationText(order),
      html: buildOrderConfirmationHtml(order),
    });
    return { ok: true, messageId: info.messageId };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("email: order confirmation failed", order.orderId, message);
    return { ok: false, error: message };
  }
}

/** Used by the admin test endpoint: proves SMTP works without touching orders. */
export async function sendTestEmail(to: string): Promise<SendResult> {
  const cfg = config();
  if (!cfg) return { ok: false, skipped: true, error: "SMTP not configured" };
  try {
    const info = await transporter(cfg).sendMail({
      from: cfg.from,
      to,
      subject: "Yellowsky mail test",
      text: "SMTP works. Order confirmations will be sent from this address.",
    });
    return { ok: true, messageId: info.messageId };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
