import { Resend } from "resend";

export type EmailTemplate =
  | "email-verification"
  | "password-reset"
  | "booking-created"
  | "booking-confirmed"
  | "booking-cancelled";

export interface EmailVerificationData {
  name?: string | null;
  url: string;
}

export interface PasswordResetData {
  name?: string | null;
  url: string;
}

export interface BookingCreatedData {
  customerName?: string | null;
  serviceName: string;
  scheduledAt: string | Date;
  durationMinutes: number;
  price?: number | string;
  currency?: string;
  bookingId: string;
  notes?: string | null;
}

export interface BookingConfirmedData {
  customerName?: string | null;
  serviceName: string;
  scheduledAt: string | Date;
  durationMinutes: number;
  bookingId: string;
  notes?: string | null;
}

export interface BookingCancelledData {
  customerName?: string | null;
  serviceName: string;
  scheduledAt: string | Date;
  bookingId: string;
  cancellationReason?: string | null;
}

export type EmailTemplateDataMap = {
  "email-verification": EmailVerificationData;
  "password-reset": PasswordResetData;
  "booking-created": BookingCreatedData;
  "booking-confirmed": BookingConfirmedData;
  "booking-cancelled": BookingCancelledData;
};

export interface SendEmailParams<T extends EmailTemplate = EmailTemplate> {
  to: string | string[];
  subject: string;
  template: T;
  data: EmailTemplateDataMap[T];
}

export interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey || apiKey === '""' || apiKey === "''") {
    return null;
  }
  return new Resend(apiKey);
}

function getDefaultFrom(): string {
  const from = process.env.EMAIL_FROM?.trim();
  if (from && from !== '""' && from !== "''") {
    return from;
  }
  return "Slotly <onboarding@resend.dev>";
}

function emailLayout(content: string, previewText?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Slotly</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      line-height: 1.6;
    }
    .wrapper {
      width: 100%;
      background-color: #f8fafc;
      padding: 40px 16px;
    }
    .container {
      max-width: 560px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .header {
      background-color: #ffffff;
      padding: 32px 32px 16px 32px;
      text-align: center;
      border-bottom: 1px solid #f1f5f9;
    }
    .logo {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 24px;
      font-weight: 700;
      color: #2563eb;
      text-decoration: none;
      letter-spacing: -0.5px;
    }
    .body {
      padding: 32px;
    }
    h1 {
      font-size: 22px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 0;
      margin-bottom: 16px;
    }
    p {
      font-size: 15px;
      color: #475569;
      margin-top: 0;
      margin-bottom: 20px;
    }
    .btn-container {
      text-align: center;
      margin: 28px 0;
    }
    .btn {
      display: inline-block;
      background-color: #2563eb;
      color: #ffffff !important;
      font-size: 15px;
      font-weight: 600;
      text-decoration: none;
      padding: 12px 28px;
      border-radius: 8px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }
    .card {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 20px;
      margin: 24px 0;
    }
    .card-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #edf2f7;
      font-size: 14px;
    }
    .card-row:last-child {
      border-bottom: none;
    }
    .card-label {
      color: #64748b;
      font-weight: 500;
    }
    .card-value {
      color: #0f172a;
      font-weight: 600;
      text-align: right;
    }
    .footer {
      background-color: #f8fafc;
      padding: 24px 32px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
      font-size: 13px;
      color: #94a3b8;
    }
    .footer p {
      margin: 0 0 8px 0;
      font-size: 12px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  ${previewText ? `<div style="display:none;font-size:1px;color:#f8fafc;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${previewText}</div>` : ""}
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <span class="logo">⚡ Slotly</span>
      </div>
      <div class="body">
        ${content}
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Slotly. All rights reserved.</p>
        <p>The modern appointment scheduling & booking platform.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

function renderTemplate<T extends EmailTemplate>(template: T, data: EmailTemplateDataMap[T]): string {
  switch (template) {
    case "email-verification": {
      const { name, url } = data as EmailVerificationData;
      const greeting = name ? `Hi ${name},` : "Hello,";
      const content = `
        <h1>Verify your email address</h1>
        <p>${greeting}</p>
        <p>Thank you for signing up for Slotly. Please verify your email address to complete your registration and activate your account.</p>
        <div class="btn-container">
          <a href="${url}" class="btn" target="_blank">Verify Email Address</a>
        </div>
        <p style="font-size: 13px; color: #94a3b8;">If the button above doesn't work, copy and paste this link into your browser:<br>
          <a href="${url}" style="color: #2563eb; word-break: break-all;">${url}</a>
        </p>
        <p style="font-size: 13px; color: #94a3b8;">This link will expire in 24 hours. If you did not create a Slotly account, you can safely ignore this email.</p>
      `;
      return emailLayout(content, "Verify your Slotly email address");
    }

    case "password-reset": {
      const { name, url } = data as PasswordResetData;
      const greeting = name ? `Hi ${name},` : "Hello,";
      const content = `
        <h1>Reset your password</h1>
        <p>${greeting}</p>
        <p>We received a request to reset your password for your Slotly account. Click the button below to choose a new password.</p>
        <div class="btn-container">
          <a href="${url}" class="btn" target="_blank">Reset Password</a>
        </div>
        <p style="font-size: 13px; color: #94a3b8;">If the button above doesn't work, copy and paste this link into your browser:<br>
          <a href="${url}" style="color: #2563eb; word-break: break-all;">${url}</a>
        </p>
        <p style="font-size: 13px; color: #94a3b8;">This password reset link will expire in 1 hour. If you did not request a password reset, no further action is required and your account remains secure.</p>
      `;
      return emailLayout(content, "Reset your Slotly password");
    }

    case "booking-created": {
      const {
        customerName,
        serviceName,
        scheduledAt,
        durationMinutes,
        price,
        currency = "USD",
        bookingId,
        notes,
      } = data as BookingCreatedData;
      const greeting = customerName ? `Hi ${customerName},` : "Hello,";
      const formattedDate = new Date(scheduledAt).toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short",
      });

      const content = `
        <h1>Booking Request Received</h1>
        <p>${greeting}</p>
        <p>Your appointment booking request has been received and is currently being processed.</p>
        
        <table style="width: 100%; border-collapse: collapse; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; margin: 20px 0;">
          <tr>
            <td style="padding: 12px 16px; font-weight: 500; color: #64748b; border-bottom: 1px solid #e2e8f0;">Service</td>
            <td style="padding: 12px 16px; font-weight: 600; color: #0f172a; text-align: right; border-bottom: 1px solid #e2e8f0;">${serviceName}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-weight: 500; color: #64748b; border-bottom: 1px solid #e2e8f0;">Date & Time</td>
            <td style="padding: 12px 16px; font-weight: 600; color: #0f172a; text-align: right; border-bottom: 1px solid #e2e8f0;">${formattedDate}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-weight: 500; color: #64748b; border-bottom: 1px solid #e2e8f0;">Duration</td>
            <td style="padding: 12px 16px; font-weight: 600; color: #0f172a; text-align: right; border-bottom: 1px solid #e2e8f0;">${durationMinutes} minutes</td>
          </tr>
          ${
            price !== undefined
              ? `<tr>
            <td style="padding: 12px 16px; font-weight: 500; color: #64748b; border-bottom: 1px solid #e2e8f0;">Price</td>
            <td style="padding: 12px 16px; font-weight: 600; color: #0f172a; text-align: right; border-bottom: 1px solid #e2e8f0;">$${Number(price).toFixed(2)} ${currency}</td>
          </tr>`
              : ""
          }
          <tr>
            <td style="padding: 12px 16px; font-weight: 500; color: #64748b; border-bottom: 1px solid #e2e8f0;">Status</td>
            <td style="padding: 12px 16px; font-weight: 600; color: #d97706; text-align: right; border-bottom: 1px solid #e2e8f0;">Pending Confirmation</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-weight: 500; color: #64748b;">Booking Reference</td>
            <td style="padding: 12px 16px; font-family: monospace; font-size: 13px; color: #475569; text-align: right;">${bookingId.slice(0, 8)}</td>
          </tr>
        </table>

        ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ""}
        <p>We will notify you once your booking is confirmed.</p>
      `;
      return emailLayout(content, `Booking request received for ${serviceName}`);
    }

    case "booking-confirmed": {
      const { customerName, serviceName, scheduledAt, durationMinutes, bookingId, notes } =
        data as BookingConfirmedData;
      const greeting = customerName ? `Hi ${customerName},` : "Hello,";
      const formattedDate = new Date(scheduledAt).toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short",
      });

      const content = `
        <h1>Booking Confirmed! 🎉</h1>
        <p>${greeting}</p>
        <p>Great news! Your booking has been confirmed. Here are the details:</p>
        
        <table style="width: 100%; border-collapse: collapse; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; margin: 20px 0;">
          <tr>
            <td style="padding: 12px 16px; font-weight: 500; color: #64748b; border-bottom: 1px solid #e2e8f0;">Service</td>
            <td style="padding: 12px 16px; font-weight: 600; color: #0f172a; text-align: right; border-bottom: 1px solid #e2e8f0;">${serviceName}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-weight: 500; color: #64748b; border-bottom: 1px solid #e2e8f0;">Date & Time</td>
            <td style="padding: 12px 16px; font-weight: 600; color: #0f172a; text-align: right; border-bottom: 1px solid #e2e8f0;">${formattedDate}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-weight: 500; color: #64748b; border-bottom: 1px solid #e2e8f0;">Duration</td>
            <td style="padding: 12px 16px; font-weight: 600; color: #0f172a; text-align: right; border-bottom: 1px solid #e2e8f0;">${durationMinutes} minutes</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-weight: 500; color: #64748b; border-bottom: 1px solid #e2e8f0;">Status</td>
            <td style="padding: 12px 16px; font-weight: 600; color: #16a34a; text-align: right; border-bottom: 1px solid #e2e8f0;">Confirmed</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-weight: 500; color: #64748b;">Booking Reference</td>
            <td style="padding: 12px 16px; font-family: monospace; font-size: 13px; color: #475569; text-align: right;">${bookingId.slice(0, 8)}</td>
          </tr>
        </table>

        ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ""}
        <p>We look forward to serving you!</p>
      `;
      return emailLayout(content, `Your booking for ${serviceName} is confirmed`);
    }

    case "booking-cancelled": {
      const { customerName, serviceName, scheduledAt, bookingId, cancellationReason } =
        data as BookingCancelledData;
      const greeting = customerName ? `Hi ${customerName},` : "Hello,";
      const formattedDate = new Date(scheduledAt).toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short",
      });

      const content = `
        <h1>Booking Cancelled</h1>
        <p>${greeting}</p>
        <p>Your booking for <strong>${serviceName}</strong> has been cancelled.</p>
        
        <table style="width: 100%; border-collapse: collapse; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; margin: 20px 0;">
          <tr>
            <td style="padding: 12px 16px; font-weight: 500; color: #64748b; border-bottom: 1px solid #e2e8f0;">Service</td>
            <td style="padding: 12px 16px; font-weight: 600; color: #0f172a; text-align: right; border-bottom: 1px solid #e2e8f0;">${serviceName}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-weight: 500; color: #64748b; border-bottom: 1px solid #e2e8f0;">Originally Scheduled</td>
            <td style="padding: 12px 16px; font-weight: 600; color: #0f172a; text-align: right; border-bottom: 1px solid #e2e8f0;">${formattedDate}</td>
          </tr>
          ${
            cancellationReason
              ? `<tr>
            <td style="padding: 12px 16px; font-weight: 500; color: #64748b; border-bottom: 1px solid #e2e8f0;">Reason</td>
            <td style="padding: 12px 16px; color: #dc2626; text-align: right; border-bottom: 1px solid #e2e8f0;">${cancellationReason}</td>
          </tr>`
              : ""
          }
          <tr>
            <td style="padding: 12px 16px; font-weight: 500; color: #64748b;">Booking Reference</td>
            <td style="padding: 12px 16px; font-family: monospace; font-size: 13px; color: #475569; text-align: right;">${bookingId.slice(0, 8)}</td>
          </tr>
        </table>

        <p>If you'd like to reschedule, please visit our booking portal to choose another convenient time slot.</p>
      `;
      return emailLayout(content, `Booking cancelled: ${serviceName}`);
    }

    default:
      throw new Error(`Unsupported email template: ${template}`);
  }
}

/**
 * Send transactional email using Resend.
 * Gracefully handles missing API keys without throwing in non-production environments.
 * Sensitive data such as tokens and passwords are never logged.
 */
export async function sendEmail<T extends EmailTemplate>(
  params: SendEmailParams<T>
): Promise<SendEmailResult> {
  const { to, subject, template, data } = params;
  const resend = getResendClient();
  const from = getDefaultFrom();

  if (!resend) {
    if (process.env.NODE_ENV !== "production") {
      const recipientStr = Array.isArray(to) ? to.join(", ") : to;
      console.warn(
        `[Slotly Email] RESEND_API_KEY is not configured. Simulating email dispatch to: ${recipientStr} with subject: "${subject}"`
      );
    }
    return { success: true, id: "simulated-email-id" };
  }

  try {
    const html = renderTemplate(template, data);

    const response = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    if (response.error) {
      console.error("[Slotly Email] Resend API error:", response.error.message);
      return { success: false, error: response.error.message };
    }

    console.log(`[Slotly Email] Email sent successfully via Resend. Message ID: ${response.data?.id}`);
    return { success: true, id: response.data?.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error while sending email";
    console.error("[Slotly Email] Failed to send email:", message);
    return { success: false, error: message };
  }
}
