# Review Rocket Demo - Project Guide

## Overview

Review Rocket Demo is a comprehensive, static web application that showcases a customer feedback collection system with integrated lead generation. The demo simulates a complete review funnel where customers can rate their experience and are intelligently routed based on their rating, while also serving as a lead capture system for prospects interested in implementing Review Rocket for their business.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a **hybrid static + serverless architecture** optimized for Vercel deployment. The frontend is purely static while email notifications are handled via serverless functions.

### Key Architectural Decisions:

1. **Static Frontend**: Pure client-side application using vanilla HTML, CSS, and JavaScript with ES6 modules
2. **Serverless Backend**: Vercel serverless function (`/api/send-lead.js`) handles email notifications via nodemailer
3. **Configuration-Driven**: Single config file allows easy customization without code changes  
4. **Mobile-First Design**: Responsive CSS ensures optimal experience across all devices
5. **Gmail SMTP Integration**: Direct SMTP email notifications using Gmail app passwords for reliability

## Key Components

### Frontend Pages
- **`index.html`**: Main landing page with star rating system, optional user info collection, and explainer tooltips
- **`thank-you.html`**: Success page for high ratings (≥4 stars) with external review CTA and business inquiry CTA
- **`feedback.html`**: Feedback collection page for low ratings (≤3 stars) with business inquiry CTA
- **`lead-form.html`**: Business inquiry form with auto-prefilling from demo data and comprehensive lead capture

### JavaScript Modules
- **`demo/src/main.js`**: Core application logic, star rating functionality, and form handling
- **`demo/src/config.js`**: Centralized configuration for branding, colors, texts, and URLs
- **`api/send-lead.js`**: Vercel serverless function for email notifications using nodemailer (production)

### Styling
- **`demo/src/ui.css`**: Comprehensive CSS with custom properties for theming, responsive design, and component styles

### Assets
- **`demo/public/logo.svg`**: Business logo (configurable via config)

### Configuration
- **`vercel.json`**: Deployment configuration with routing rules and security headers
- **`package.json`**: Dependencies (nodemailer) and deployment scripts

## Data Flow

1. **User Landing**: Customer visits main page (`index.html`)
2. **Rating Collection**: User selects star rating (1-5) and optionally provides name/email
3. **Smart Routing**: 
   - Low ratings (1-3 stars) → `feedback.html` for improvement suggestions
   - High ratings (4-5 stars) → `thank-you.html` for public review request
4. **Data Persistence**: User data temporarily stored in browser session/localStorage
5. **External Integration**: High-rated users redirected to configured public review platform

## External Dependencies

- **Production**: Vercel serverless functions with nodemailer for email notifications
- **Development**: Simple Node.js static file server (`demo/dev-server.js`) for local testing
- **Deployment**: Optimized for Vercel hosting with proper routing via `vercel.json`
- **Review Platform**: Configurable external URL (defaults to Google Reviews search)
- **Lead Notifications**: Gmail SMTP integration using app passwords for reliability

## Email Configuration Status

All required email secrets are configured:
- ✅ SMTP_HOST (smtp.gmail.com)
- ✅ SMTP_USER (Gmail address)
- ✅ SMTP_PASS (Gmail app password)
- ✅ FROM_EMAIL (sender email)
- ✅ OWNER_EMAIL (notification recipient)

**Important**: Email notifications only work in production (Vercel deployment), not in local development.

## Deployment Strategy

### Static Hosting Configuration
- **Platform**: Vercel (primary target)
- **Build Process**: No build step required - direct static file serving
- **Security Headers**: Configured via `vercel.json` for XSS protection, frame denial, and content type security
- **Routing**: Simple static file routing with fallback support

### Customization Process
1. Update `src/config.js` with business-specific branding and URLs
2. Replace `public/logo.svg` with business logo
3. Deploy to any static hosting provider
4. No backend setup or database configuration required

### Environment Considerations
- **Development**: Can run locally with any static file server
- **Production**: Optimized for CDN delivery and caching
- **Scalability**: Inherently scalable due to static nature
- **Maintenance**: Minimal - only requires content updates via config file