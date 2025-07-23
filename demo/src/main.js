import { config } from './config.js';

let selectedRating = 0;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
  setupStarRating();
  setupForm();
  setupExplainers();
});

function initializeApp() {
  // Apply configuration to DOM elements
  const elements = {
    businessName: document.getElementById('business-name'),
    headline: document.getElementById('headline'),
    subhead: document.getElementById('subhead'),
    submitBtn: document.getElementById('submit-btn'),
    logo: document.getElementById('logo')
  };

  if (elements.businessName) elements.businessName.textContent = config.businessName;
  if (elements.headline) elements.headline.textContent = config.texts.landingHeadline;
  if (elements.subhead) elements.subhead.textContent = config.texts.landingSubhead;
  if (elements.submitBtn) elements.submitBtn.textContent = config.texts.submitBtn;
  if (elements.logo) elements.logo.src = config.logoPath;

  // Configure lead capture
  const leadCaptureGroup = document.getElementById('lead-capture-group');
  const leadCaptureLabel = document.getElementById('lead-capture-label');
  
  if (leadCaptureGroup && leadCaptureLabel) {
    leadCaptureLabel.textContent = config.texts.leadCaptureLabel;
    
    // Hide lead capture if not in demo mode or disabled
    if (!config.leadCaptureUrl) {
      leadCaptureGroup.style.display = 'none';
    }
  }

  // Configure explainer texts
  const headlineExplainerText = document.getElementById('headline-explainer-text');
  const starExplainerText = document.getElementById('star-explainer-text');
  
  if (headlineExplainerText) headlineExplainerText.textContent = config.explainers.headline;
  if (starExplainerText) starExplainerText.textContent = config.explainers.starWidget;

  // Hide explainers if disabled
  if (!config.flags.showExplainers) {
    const explainers = document.querySelectorAll('.explainer-btn');
    explainers.forEach(btn => btn.style.display = 'none');
  }

  // Set CSS custom properties for theming
  document.documentElement.style.setProperty('--primary-color', config.primaryColor);
  
  // Update page title
  document.title = `${config.businessName} - Feedback`;
}

function setupStarRating() {
  const starContainer = document.getElementById('star-rating');
  if (!starContainer) return;

  const stars = starContainer.querySelectorAll('.star');
  const submitBtn = document.getElementById('submit-btn');

  stars.forEach((star, index) => {
    // Handle click events
    star.addEventListener('click', (e) => {
      e.preventDefault();
      const rating = parseInt(star.dataset.rating);
      selectRating(rating);
    });

    // Handle hover effects
    star.addEventListener('mouseenter', () => {
      const rating = parseInt(star.dataset.rating);
      highlightStars(rating);
    });

    star.addEventListener('mouseleave', () => {
      highlightStars(selectedRating);
    });

    // Handle keyboard navigation
    star.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const rating = parseInt(star.dataset.rating);
        selectRating(rating);
      }
    });
  });

  // Reset stars when mouse leaves container
  starContainer.addEventListener('mouseleave', () => {
    highlightStars(selectedRating);
  });

  function selectRating(rating) {
    selectedRating = rating;
    highlightStars(rating);
    
    // Enable submit button
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.classList.add('enabled');
    }
  }

  function highlightStars(rating) {
    stars.forEach((star, index) => {
      const starRating = index + 1;
      const starIcon = star.querySelector('.star-icon');
      
      if (starRating <= rating) {
        star.classList.add('filled');
        starIcon.setAttribute('fill', 'currentColor');
      } else {
        star.classList.remove('filled');
        starIcon.setAttribute('fill', 'none');
      }
    });
  }
}

function setupForm() {
  const form = document.getElementById('rating-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (selectedRating === 0) {
      alert('Please select a rating before submitting.');
      return;
    }

    const formData = new FormData(form);
    const name = formData.get('name') || '';
    const email = formData.get('email') || '';
    const leadCapture = formData.get('leadCapture') === 'on';
    const honeypot = formData.get('_hp');
    
    // Store user data in sessionStorage for form prefilling
    sessionStorage.setItem('rr_name', name || '');
    sessionStorage.setItem('rr_email', email || '');
    sessionStorage.setItem('rr_rating', String(selectedRating || ''));
    
    // Handle lead capture (if enabled and checkbox is checked)
    if (leadCapture && config.leadCaptureUrl && !honeypot) {
      handleLeadCapture(name, email, selectedRating);
    }
    
    // Build query parameters for next page
    const params = new URLSearchParams();
    params.set('rating', selectedRating.toString());
    if (name) params.set('name', name);
    if (email) params.set('email', email);
    
    // Route based on rating
    if (selectedRating <= 3) {
      window.location.href = `feedback.html?${params.toString()}`;
    } else {
      window.location.href = `thank-you.html?${params.toString()}`;
    }
  });
}

// Handle lead capture submission via Vercel serverless function
async function handleLeadCapture(name, email, rating) {
  if (!config.leadCaptureUrl) return;
  
  const payload = {
    name: name || 'Anonymous',
    email: email || '',
    source: 'demo_rating',
    rating: rating,
    timestamp: new Date().toISOString()
  };
  
  try {
    const response = await fetch(config.leadCaptureUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    if (response.ok) {
      console.log('✅ Lead captured successfully');
    } else {
      console.log('⚠️ Lead capture returned non-200 status');
    }
  } catch (error) {
    // Silently fail - don't block user experience
    console.log('Lead capture failed:', error);
  }
}

// Setup explainer functionality
function setupExplainers() {
  if (!config.flags.showExplainers) return;
  
  const explainerButtons = document.querySelectorAll('.explainer-btn');
  const tooltips = document.querySelectorAll('.tooltip');
  
  explainerButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const tooltipId = button.id.replace('-explainer', '-tooltip');
      const tooltip = document.getElementById(tooltipId);
      
      if (tooltip) {
        // Hide all other tooltips
        tooltips.forEach(t => t.classList.remove('visible'));
        
        // Show this tooltip
        tooltip.classList.add('visible');
        
        // Position tooltip near the button
        positionTooltip(tooltip, button);
      }
    });
  });
  
  // Close tooltip functionality
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('tooltip-close')) {
      e.target.closest('.tooltip').classList.remove('visible');
    }
    
    // Close tooltips when clicking outside
    if (!e.target.closest('.explainer-btn') && !e.target.closest('.tooltip')) {
      tooltips.forEach(tooltip => tooltip.classList.remove('visible'));
    }
  });
  
  // Escape key to close tooltips
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      tooltips.forEach(tooltip => tooltip.classList.remove('visible'));
    }
  });
}

// Position tooltip relative to trigger button
function positionTooltip(tooltip, trigger) {
  const triggerRect = trigger.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();
  
  // Position to the right of the trigger, or left if no space
  let left = triggerRect.right + 10;
  let top = triggerRect.top;
  
  // Check if tooltip would go off-screen
  if (left + tooltipRect.width > window.innerWidth) {
    left = triggerRect.left - tooltipRect.width - 10;
  }
  
  // Ensure tooltip stays within viewport
  if (left < 10) left = 10;
  if (top + tooltipRect.height > window.innerHeight) {
    top = window.innerHeight - tooltipRect.height - 10;
  }
  if (top < 10) top = 10;
  
  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}

// Utility functions for other pages
export function getQueryParams() {
  return new URLSearchParams(window.location.search);
}

export function showSuccessMessage(message) {
  const successDiv = document.createElement('div');
  successDiv.className = 'success-toast';
  successDiv.textContent = message;
  document.body.appendChild(successDiv);
  
  setTimeout(() => {
    successDiv.remove();
  }, 3000);
}
