const nodemailer = require('nodemailer');

/**
 * Send an email using SMTP or elegant console logging in dev environment.
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} [options.text] - Plain text version
 * @param {string} [options.html] - HTML body version
 */
exports.sendEmail = async (options) => {
  const isProd = process.env.NODE_ENV === 'production';
  const hasSMTP = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

  if (isProd || hasSMTP) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
        port: parseInt(process.env.SMTP_PORT || '2525', 10),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || 'MedFlow AI Clinic'}" <${process.env.SMTP_FROM_EMAIL || 'no-reply@medflow.com'}>`,
        to: options.to,
        subject: options.subject,
        text: options.text || '',
        html: options.html || ''
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`✉️ Email successfully dispatched to ${options.to} (MessageID: ${info.messageId})`);
      return info;
    } catch (error) {
      console.error(`❌ SMTP Clinical Dispatch Failed:`, error.message);
      // Fail gracefully or log to prevent service crash in development/staging
    }
  }

  // Elegant CLI logger for local development
  console.log(`
  ┌──────────────────────────────────────────────────────────┐
  │              ✉️  DEVELOPMENT CLINICAL EMAIL DISPATCH      │
  ├──────────────────────────────────────────────────────────┤
  │ To:      ${options.to.padEnd(46)} │
  │ Subject: ${options.subject.padEnd(46)} │
  ├──────────────────────────────────────────────────────────┤
  │ Body:                                                    │
  │ ${String(options.text || 'HTML Content (See below)').substring(0, 150).replace(/\n/g, '\n  │ ')}...
  └──────────────────────────────────────────────────────────┘
  `);
  
  if (options.html) {
    console.log('--- [HTML Render Start] ---');
    console.log(options.html);
    console.log('--- [HTML Render End] ---');
  }

  return { success: true, message: 'Simulated dev dispatch success.' };
};
