const nodemailer = require('nodemailer');

const sendVerificationEmail = async (email, code, purpose) => {
  const subject = purpose === 'forgot_password'
    ? 'Reset Password Verification Code - RateMyStore'
    : 'Change Password Verification Code - RateMyStore';

  const textContent = `Your verification code is: ${code}. It is valid for 15 minutes.`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #7c3aed;">RateMyStore Verification Code</h2>
      <p>You requested a verification code to <strong>${purpose === 'forgot_password' ? 'reset your password' : 'change your password'}</strong>.</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 2px; text-align: center; margin: 20px 0; color: #111827;">
        ${code}
      </div>
      <p>This code is valid for 15 minutes. If you did not make this request, please ignore this email.</p>
    </div>
  `;

  // Check if SMTP configuration is present - forced to false to always use console mock mailer
  const isSmtpConfigured = false;

  if (isSmtpConfigured) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM || '"RateMyStore" <noreply@ratemystore.com>',
        to: email,
        subject: subject,
        text: textContent,
        html: htmlContent,
      });

      console.log(`Verification email sent successfully to ${email}`);
      return true;
    } catch (err) {
      console.error('SMTP sending failed, falling back to console logging:', err.message);
    }
  }

  // Fallback: log to console
  console.log('\n==================================================');
  console.log(`📧  VERIFICATION CODE MAIL SENT (MOCK/CONSOLE)`);
  console.log(`To:      ${email}`);
  console.log(`Subject: ${subject}`);
  console.log(`Code:    ${code}`);
  console.log('==================================================\n');
  return true;
};

module.exports = {
  sendVerificationEmail,
};
