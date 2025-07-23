// Vercel serverless function for handling lead submissions
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed");
  }

  try {
    /* ── Parse & basic validation ────────────────────────────── */
    const body      = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const hasName   = body.name || (body.firstName || body.lastName);

    // allow anonymous feedback, require a name everywhere else
    if (!hasName && body.source !== "feedback") {
      return res.status(400).json({ ok: false, error: "Name is required" });
    }

    if (body._hp) {                         // honeypot
      console.log("Bot detected, ignoring submission");
      return res.status(200).json({ ok: true });
    }

    /* ── Nodemailer transporter ──────────────────────────────── */
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT || 465),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    /* ── Prepare lead data ───────────────────────────────────── */
    const leadName     = body.name || `${body.firstName || ""} ${body.lastName || ""}`.trim();
    const leadEmail    = body.email || "";
    const leadRating   = body.rating || "";
    const leadFeedback = body.feedback || "";
    const leadSource   = body.source || "unknown";
    const timestamp    = new Date().toLocaleString();

    const isFeedback = leadSource === "feedback";   // low‑score page
    const isSetup    = leadSource === "setup";      // get‑started / pricing form

    /* ── Owner notification (plain + HTML) ───────────────────── */
    const ownerPlain = `
=== NEW REVIEW ROCKET DEMO LEAD ===

Name:   ${leadName || "(not provided)"}
Email:  ${leadEmail || "(not provided)"}

Source:  ${leadSource}
Rating:  ${leadRating || "Not provided"}
When:    ${timestamp}

${leadFeedback ? `Feedback:\n${leadFeedback}\n` : ""}
=========================================
`;

    const ownerHtml = `
<div style="font-family: Arial, sans-serif; max-width: 600px;">
  <h2 style="color:#0ea5e9;">New Review Rocket Demo Lead</h2>

  <div style="background:#f8f9fa;padding:20px;border-radius:8px;margin:20px 0;">
    <h3>Contact Information</h3>
    <p><strong>Name:</strong> ${leadName || "—"}</p>
    <p><strong>Email:</strong> ${leadEmail || "—"}</p>
  </div>

  <div style="background:#f8f9fa;padding:20px;border-radius:8px;margin:20px 0;">
    <h3>Demo Activity</h3>
    <p><strong>Rating:</strong> ${leadRating ? leadRating + " stars" : "Not provided"}</p>
    <p><strong>Source:</strong> ${leadSource}</p>
    <p><strong>Submitted:</strong> ${timestamp}</p>
  </div>

  ${leadFeedback ? `
    <div style="background:#f8f9fa;padding:20px;border-radius:8px;margin:20px 0;">
      <h3>Feedback</h3>
      <p style="white-space:pre-line;">${leadFeedback}</p>
    </div>` : ''}

  <p style="color:#666;font-size:12px;">
    This lead was captured from the Review Rocket demo at ${req.headers.origin || "unknown origin"}.
  </p>
</div>
`;

    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to:   process.env.OWNER_EMAIL,
      subject: `New Review Rocket Demo Lead: ${leadName || "No name"}`,
      text: ownerPlain,
      html: ownerHtml,
    });

    /* ── Visitor follow‑up (optional) ────────────────────────── */
    if (leadEmail && leadEmail.includes("@")) {
      try {
        if (isFeedback) {
          await transporter.sendMail({
            from: process.env.FROM_EMAIL,
            to:   leadEmail,
            subject: "3 Stars or Lower Sent to You",
            text:
`Hi ${leadName || "there"},

In the event your customer gives you less than 4 stars, you will get an email with their feedback so you can contact them directly.

Just hit reply if you are interested in seeing how this could work in your business-

Best,
Jane Doe
Review Rocket AI`,
          });
        } else if (isSetup) {
          await transporter.sendMail({
            from: process.env.FROM_EMAIL,
            to:   leadEmail,
            subject: "Thanks for Your Interest in Review Rocket!",
            text:
`Hi ${leadName},

Thanks for trying our Review Rocket demo! We'll be in touch soon with setup instructions and pricing details.

Best regards,
The Review Rocket Team`,
          });
        }
      } catch (err) {
        console.log("Failed to send visitor email:", err.message);
        // don't fail the whole request if visitor email fails
      }
    }

    console.log(`✅ Lead notification emails sent successfully for ${leadName}`);
    return res.status(200).json({ ok: true });

  } catch (error) {
    console.error("❌ Failed to send lead notification:", error);
    return res.status(500).json({ ok: false, error: "MAIL_FAIL" });
  }
}
