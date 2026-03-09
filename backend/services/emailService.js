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
export const sendTemporaryPasswordEmail = async (user, tempPassword) => {
    const loginUrl = `${process.env.FRONTEND_URL}/login`;
    const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #e2e8f0; border-radius: 24px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2563eb; margin: 0; font-size: 28px;">Welcome to the Team!</h1>
                <p style="color: #64748b; margin-top: 8px;">Your HR account has been created</p>
            </div>
            
            <p style="color: #1e293b; font-size: 16px; line-height: 1.6;">Hello <strong>${user.first_name}</strong>,</p>
            <p style="color: #475569; font-size: 15px; line-height: 1.6;">An account has been set up for you in the Hotel HR Management System. You can now log in using the credentials below:</p>
            
            <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); padding: 30px; border-radius: 20px; border: 1px border #e2e8f0; margin: 30px 0; text-align: center;">
                <div style="margin-bottom: 15px;">
                    <p style="text-transform: uppercase; letter-spacing: 1px; font-size: 11px; font-weight: 800; color: #94a3b8; margin-bottom: 5px;">Username / Email</p>
                    <p style="font-size: 16px; color: #1e293b; font-weight: 600; margin: 0;">${user.email}</p>
                </div>
                <div>
                    <p style="text-transform: uppercase; letter-spacing: 1px; font-size: 11px; font-weight: 800; color: #94a3b8; margin-bottom: 5px;">Temporary Password</p>
                    <p style="font-size: 20px; color: #2563eb; font-weight: 700; font-family: monospace; margin: 0;">${tempPassword}</p>
                </div>
            </div>
            
            <div style="text-align: center; margin-bottom: 30px;">
                <a href="${loginUrl}" style="background-color: #2563eb; color: #ffffff; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block; transition: all 0.2s;">Login to Your Dashboard</a>
            </div>
            
            <div style="background-color: #fffbeb; border: 1px solid #fef3c7; padding: 20px; border-radius: 16px; margin-bottom: 30px;">
                <p style="color: #92400e; font-size: 13px; margin: 0; line-height: 1.5;">
                    <strong>Security Tip:</strong> For your protection, please change this temporary password immediately after your first login through your profile settings.
                </p>
            </div>
            
            <hr style="border: 0; border-top: 1px solid #f1f5f9; margin-bottom: 30px;" />
            <p style="text-align: center; color: #94a3b8; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} Hotel HR Management System. All rights reserved.</p>
        </div>
    `;

    return sendEmail({
        to: user.email,
        subject: 'Welcome to Hotel HR - Your Account Credentials',
        html,
    });
};
