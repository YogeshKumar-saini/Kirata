"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../../.env') });
class EmailService {
    constructor() {
        this.fromEmail = process.env.EMAIL_FROM || 'Kirata <noreply@kirata.app>';
        console.log('📧 Initializing Email Service...');
        console.log('   SMTP Host:', process.env.SMTP_HOST);
        console.log('   SMTP Port:', process.env.SMTP_PORT);
        console.log('   SMTP Secure:', process.env.SMTP_SECURE);
        console.log('   SMTP User:', process.env.SMTP_USER);
        // Create reusable transporter object using the default SMTP transport
        this.transporter = nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
        // Verify connection immediately
        this.verifyConnection().catch(err => {
            console.error('❌ Failed to verify SMTP connection on startup:', err);
        });
    }
    async verifyConnection() {
        try {
            await this.transporter.verify();
            console.log('✅ SMTP connection established successfully');
            return true;
        }
        catch (error) {
            console.error('❌ SMTP connection failed:', error);
            return false;
        }
    }
    async sendMail(options) {
        try {
            console.log(`📧 Attempting to send email to: ${options.to}...`);
            const info = await this.transporter.sendMail({
                from: this.fromEmail,
                to: options.to,
                subject: options.subject,
                html: options.html,
                attachments: options.attachments,
            });
            console.log('📧 Email sent successfully! Message ID:', info.messageId);
            return info;
        }
        catch (error) {
            console.error('❌ Failed to send email to:', options.to);
            console.error('❌ Error details:', error);
            throw error;
        }
    }
    /**
     * Send OTP code via email
     * @param email - Recipient email address
     * @param otp - The OTP code
     */
    async sendOTP(email, otp) {
        console.log(`[DEBUG] OTP for ${email}: ${otp}`);
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
                    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
                    .content { padding: 40px 30px; }
                    .otp-code { background-color: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0; }
                    .otp-number { font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace; }
                    .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; }
                    .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; color: #856404; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="margin: 0;">Kirata</h1>
                        <p style="margin: 10px 0 0 0; opacity: 0.9;">Your One-Time Password</p>
                    </div>
                    <div class="content">
                        <p>Hello,</p>
                        <p>You requested a one-time password (OTP) to verify your identity. Please use the code below:</p>
                        
                        <div class="otp-code">
                            <div class="otp-number">${otp}</div>
                        </div>
                        
                        <div class="warning">
                            <strong>⚠️ Security Notice:</strong> This code will expire in 10 minutes. Do not share this code with anyone.
                        </div>
                        
                        <p>If you didn't request this code, please ignore this email or contact support if you have concerns.</p>
                        
                        <p style="margin-top: 30px;">Best regards,<br><strong>Kirata Team</strong></p>
                    </div>
                    <div class="footer">
                        <p>This is an automated message, please do not reply to this email.</p>
                        <p>&copy; ${new Date().getFullYear()} Kirata. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
        await this.sendMail({
            to: email,
            subject: `Your OTP Code: ${otp}`,
            html
        });
    }
}
exports.emailService = new EmailService();
