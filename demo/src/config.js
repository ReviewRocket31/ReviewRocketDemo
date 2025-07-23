export const config = {
  businessName: "[Your Business Name Here]",
  primaryColor: "#0ea5e9", // Tailwind sky-500 as default
  logoPath: "public/logo.svg",
  publicReviewUrl: "https://www.google.com/search?q=google+reviews",
  
  // Lead capture configuration (back to nodemailer via Vercel serverless)
  leadCaptureUrl: "/api/send-lead", // Vercel serverless function endpoint
  
  cta: {
    show: true,
    link: "lead-form.html", // Back to internal lead form
    headline: "Want this system running for your business?",
    subhead: "We'll set it up for you.",
    button: "Get Started Today"
  },
  
  flags: {
    showExplainers: true,
    showCTA: true
  },
  
  texts: {
    landingHeadline: "Tell Us How We Did",
    landingSubhead: "Your feedback helps us serve you better.",
    submitBtn: "Submit Review",
    leadCaptureLabel: "Send me details on setting this up for my business",
    lowHeader: "We're Sorry to Hear That…",
    lowBody: "Help us make things right. Tell us how we can improve.",
    lowSubmit: "Send Feedback",
    highHeader: "Thanks for the Kind Words!",
    highBody: "Would you be willing to leave this review on our public profile?",
    highCta: "Leave a Google Review"
  },
  

  
  formPrefillMap: {
    name: 'name',
    email: 'email'
  },
  
  explainers: {
    headline: "This is the exact page your customers see when you ask for feedback. We will customize this with your business name, logo, and branding colors.",
    starWidget: "Low ratings (1-3 stars) go to a private feedback form. High ratings (4-5 stars) are directed to leave public reviews."
  }
};
