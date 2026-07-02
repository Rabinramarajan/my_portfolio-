// Production environment configuration
export const environment = {
  production: true,
  emailjs: {
    serviceId: 'service_your_service_id',      // Replace with your EmailJS Service ID
    templateId: 'template_your_template_id',   // Replace with your EmailJS Template ID
    publicKey: 'your_public_key',              // Replace with your EmailJS Public Key
    recipientEmail: 'your-email@example.com'   // Replace with your email
  }
};

/**
 * PRODUCTION DEPLOYMENT NOTES:
 * 
 * - Use environment variables or a secrets management system
 * - Never commit real credentials to version control
 * - Add your domain to EmailJS security whitelist
 * - Use the same credentials as development for testing
 * - Monitor email delivery from EmailJS dashboard
 */
