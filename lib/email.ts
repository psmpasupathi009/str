import nodemailer from 'nodemailer';
import { OTPType } from '@prisma/client';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendOTPEmail(email: string, otp: string, type: OTPType) {
  const subject = type === OTPType.SIGNUP 
    ? 'Verify Your Email - STN Golden Healthy Foods'
    : 'Reset Your Password - STN Golden Healthy Foods';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #000; color: #fff;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #fff; font-weight: 300; letter-spacing: 0.1em; font-size: 24px;">STN GOLDEN</h1>
        <p style="color: #999; font-size: 12px; letter-spacing: 0.1em;">HEALTHY FOODS</p>
      </div>
      
      <div style="background-color: #111; padding: 30px; border: 1px solid #333; border-radius: 8px;">
        <h2 style="color: #fff; font-weight: 300; margin-bottom: 20px;">
          ${type === OTPType.SIGNUP ? 'Verify Your Email Address' : 'Reset Your Password'}
        </h2>
        
        <p style="color: #ccc; line-height: 1.6; margin-bottom: 30px;">
          ${type === OTPType.SIGNUP 
            ? 'Thank you for signing up! Please use the following OTP code to verify your email address:'
            : 'You requested to reset your password. Please use the following OTP code to proceed:'}
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px 40px; border-radius: 8px;">
            <h1 style="color: #fff; font-size: 36px; letter-spacing: 0.2em; margin: 0; font-weight: 300;">
              ${otp}
            </h1>
          </div>
        </div>
        
        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
          This code will expire in 10 minutes.
        </p>
        
        <p style="color: #666; font-size: 12px; text-align: center; margin-top: 20px;">
          If you didn't request this, please ignore this email.
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #333;">
        <p style="color: #666; font-size: 11px;">
          © ${new Date().getFullYear()} STN Golden Healthy Foods. All rights reserved.
        </p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send email');
  }
}
