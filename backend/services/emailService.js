import nodemailer from 'nodemailer';

const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
};

export const sendEmail = async ({ to, subject, text, html }) => {
    const transporter = createTransporter();

    const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@hotelhr.com',
        to,
        subject,
        text,
        html,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Email could not be sent');
    }
};

export const sendVerificationEmail = async (user, token) => {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;

    const html = `
        <h1>Email Verification</h1>
        <p>Hello ${user.first_name},</p>
        <p>Please use the following link to verify your email address:</p>
        <a href="${verificationUrl}" target="_blank">Verify Email</a>
        <p>If you did not request this, please ignore this email.</p>
    `;

    return sendEmail({
        to: user.email,
        subject: 'Verify your email address - Hotel HR Management',
        html,
    });
};

export const sendPasswordResetEmail = async (user, code) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h1 style="color: #2563eb; text-align: center;">Password Reset Code</h1>
            <p>Hello ${user.first_name},</p>
            <p>You requested to reset your password. Please use the following 6-digit code to complete the process:</p>
            <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e3a8a; border-radius: 8px; margin: 20px 0;">
                ${code}
            </div>
            <p style="color: #666; font-size: 14px;">This code is valid for 15 minutes. If you did not request this, please ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="text-align: center; color: #999; font-size: 12px;">Hotel HR Management System</p>
        </div>
    `;

    return sendEmail({
        to: user.email,
        subject: 'Your Password Reset Code - Hotel HR Management',
        html,
    });
};
