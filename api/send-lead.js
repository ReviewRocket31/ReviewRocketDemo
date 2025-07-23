// Vercel serverless function for handling lead submissions
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed");
  }

  try {
    // Parse request body
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    /* ── basic validation ─────────────────────────────────────── */
    const hasName = body.name || (body.firstName || body.lastName);
    if (!hasName && body.source !== "feedback") {
      return res.status(400).json({ ok: false, error: "Name is required" });
    }

    // Honeypot
    if (body._hp) {
      console.log("Bot detected, ignoring submission");
      return res.status(200).json({ ok: true });
    }

    /* ── nodemailer transporter ───────────────────────────────── */
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT || 465),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    /* ── prepare lead data ───────────────────────────────────── */
    const leadName   = body.name || `${body.firstName || ""} ${body.lastName || ""}`.trim();
    const leadEmail  = body.email || "";
    const leadRating = body.rating || "";
    const leadSource = body.source || "unknown";
    const timestamp  = new Date().toLocaleString();

    // classify origin
    const isFeedback = leadSource === "feedback";   // low‑score page
    const isSetup    = leadSource === "setup";      // get‑started / pricing form

    /* ── owner notification ──────────────────────────────────── */
    const ownerEmailContent = `
=== NEW REVIEW ROCKET DEMO LEAD ===

Contact Information:
  Name:  ${leadName}
  Email: ${leadEmail}

Demo Activity:
  Rating: ${leadRating ? leadRating + " stars" : "Not provided"}
  Source: ${leadSource}
  Submitted: ${timestamp}

Original Data:
${JSON.stringify(body, null, 2)}
================================
`;
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to:   process.env.OWNER_EMAIL,
      subject: `New Review Rocket Demo Lead: ${leadName}`,
      text: ownerEmailContent,
    });

    /* ── visitor follow‑up (optional) ─────────────────────────── */
    if (leadEmail && leadEmail.includes("@")) {
      try {
        if (isFeedback) {
          // visitor left 1‑3 stars
          await transporter.sendMail({
            from: process.env.FROM_EMAIL,
            to:   leadEmail,
            subject: "3 stars or lower sent to you",
            text:
`Hi ${leadName || "there"},

In the event your customer gives you less than 4 stars, you will get an email with their feedback so you can contact them directly. Just hit reply if you are interested in seeing how this could work in your business-

Best,
Jane Doe
Review Rocket AI`,
          });
        } else if (isSetup) {
          // setup / pricing confirmation
          await transporter.sendMail({
            from: process.env.FROM_EMAIL,
            to:   leadEmail,
            subject: "Thanks for your interest in Review Rocket!",
            text:
`Hi ${leadName},

Thanks for trying our Review Rocket demo! We'll be in touch soon with setup instructions and pricing details.

Best regards,
The Review Rocket Team`,
          });
        }
      } catch (confirmError) {
        console.log("Failed to send confirmation email:", confirmError.message);
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
