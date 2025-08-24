const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const executeWithCatch = async (asyncFn) => {
  try {
    await asyncFn();
  } catch (error) {
    console.error(`Error occurred: ${error.message}`);
  }
};

const sendEmail = async (to, subject, text, html) => {
  const msg = {
    from: process.env.SENDGRID_FROM_EMAIL,
    to,
    subject,
    text,
    html
  };
  
  await executeWithCatch(async () => {
    const res = await sgMail.send(msg);
    console.log(`Notification sent to ${to}`, res);
  });
};

const sendOtpEmail = async (to, otp) => {
  const subject = "Your Verification Code";
  const text = `Your verification code is: ${otp}\n\nThis code will expire in 10 minutes.`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f3f4f6; padding: 30px; border-radius: 8px;">
        <h2 style="color: #333; text-align: center;">Account Verification</h2>
        
        <p style="font-size: 16px; color: #555;">
          Your verification code is:
        </p>
        
        <div style="background-color: #fff; border: 1px dashed #e5e7eb; 
                   padding: 20px; text-align: center; margin: 25px 0;
                   font-size: 24px; font-weight: bold; letter-spacing: 2px;
                   border-radius: 6px;">
          ${otp}
        </div>
        
        <p style="font-size: 14px; color: #777;">
          This code will expire in 10 minutes. If you didn't request this code, 
          please ignore this email.
        </p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;
                   text-align: center; color: #9ca3af; font-size: 12px;">
        </div>
      </div>
    </div>
  `;
  await sendEmail(to, subject, text, html);
};





module.exports = {
  sendOtpEmail,
  sendEmail
};