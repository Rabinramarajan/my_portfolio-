// Development environment configuration
export const environment = {
  production: false,
  emailjs: {
    serviceId: 'service_your_service_id',      // Replace with your EmailJS Service ID
    templateId: 'template_your_template_id',   // Replace with your EmailJS Template ID
    publicKey: 'your_public_key',              // Replace with your EmailJS Public Key
    recipientEmail: 'your-email@example.com'   // Replace with your email
  }
};

/**
 * SETUP INSTRUCTIONS:
 * 
 * 1. Sign up at https://www.emailjs.com/
 * 2. Create an email service and template
 * 3. Get your credentials from EmailJS dashboard:
 *    - Service ID: Email Services → Your Service
 *    - Template ID: Email Templates → Your Template
 *    - Public Key: Account → API Keys
 * 4. Replace the placeholders above with your actual values
 * 
 * See EMAIL_JS_SETUP.md for detailed instructions
 */
