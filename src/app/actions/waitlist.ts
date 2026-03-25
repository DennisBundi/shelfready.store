"use server";

import { createSupabaseClient } from "@/lib/supabase";
import { Resend } from "resend";

export type WaitlistResult =
  | { status: "success" }
  | { status: "duplicate" }
  | { status: "error"; message: string };

const resend = new Resend(process.env.RESEND_API_KEY);

function buildConfirmationEmail(firstName: string | null): string {
  const greeting = firstName ? `Hi ${firstName},` : "Hi there,";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You're on the ShelfReady waitlist!</title>
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background:#1A2E35;padding:32px 40px;text-align:center;">
              <p style="margin:0;font-size:28px;font-weight:800;letter-spacing:-0.5px;">
                <span style="color:#ffffff;">Shelf</span><span style="color:#1D9E75;">Ready</span>
              </p>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.5);font-size:13px;letter-spacing:1px;text-transform:uppercase;">AI Product Photography</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1A2E35;">You're on the list! 🎉</p>
              <p style="margin:0 0 16px;font-size:15px;color:#6b7280;line-height:1.6;">${greeting}</p>
              <p style="margin:0 0 16px;font-size:15px;color:#6b7280;line-height:1.6;">
                Thanks for joining the <strong style="color:#1A2E35;">ShelfReady</strong> waitlist. We're building AI-powered product photography for online sellers — no studio, no photographer, no hassle.
              </p>
              <p style="margin:0 0 32px;font-size:15px;color:#6b7280;line-height:1.6;">
                We'll email you the moment we launch with early access details. You'll be among the first to try it.
              </p>

              <!-- What to expect box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#E1F5EE;border-radius:8px;margin-bottom:32px;">
                <tr>
                  <td style="padding:24px 28px;">
                    <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#1D9E75;text-transform:uppercase;letter-spacing:0.5px;">What ShelfReady does</p>
                    <p style="margin:0 0 8px;font-size:14px;color:#1A2E35;">📦 &nbsp;Upload your product photo</p>
                    <p style="margin:0 0 8px;font-size:14px;color:#1A2E35;">🤖 &nbsp;AI places it on a realistic model</p>
                    <p style="margin:0 0 8px;font-size:14px;color:#1A2E35;">🏠 &nbsp;In a professional lifestyle scene</p>
                    <p style="margin:0;font-size:14px;color:#1A2E35;">⚡ &nbsp;Ready in seconds — not days</p>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:15px;color:#6b7280;line-height:1.6;">Talk soon,<br/><strong style="color:#1A2E35;">The ShelfReady Team</strong></p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #f3f4f6;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                You're receiving this because you joined the ShelfReady waitlist.<br/>
                © ${new Date().getFullYear()} ShelfReady. All rights reserved.
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

export async function joinWaitlist(
  email: string,
  firstName: string
): Promise<WaitlistResult> {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: "error", message: "Please enter a valid email address." };
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { status: "error", message: "Supabase is not configured. Add credentials to .env.local." };
  }

  const supabase = createSupabaseClient();
  const normalizedEmail = email.toLowerCase().trim();
  const normalizedName = firstName.trim() || null;

  const { error } = await supabase.from("waitlist").insert({
    email: normalizedEmail,
    first_name: normalizedName,
  });

  if (error) {
    if (error.code === "23505") return { status: "duplicate" };
    return { status: "error", message: "Something went wrong. Please try again." };
  }

  // Send confirmation email — non-blocking, don't fail signup if email fails
  try {
    await resend.emails.send({
      from: "ShelfReady <waitlist@shelfready.store>",
      to: normalizedEmail,
      subject: "You're on the ShelfReady waitlist 🎉",
      html: buildConfirmationEmail(normalizedName),
    });
  } catch {
    // Email failure is silent — the signup succeeded, just log server-side
    console.error("[ShelfReady] Confirmation email failed for:", normalizedEmail);
  }

  return { status: "success" };
}
