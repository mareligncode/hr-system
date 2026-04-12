import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: 'd:/hr-system/backend/.env' });

const port = parseInt(process.env.SMTP_PORT);
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: port,
    secure: port === 465, // true for 465, false for 587
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS.replace(/\s+/g, ''),
    },
    tls: {
        rejectUnauthorized: false
    }
});

console.log('Testing with:');
console.log('Host:', process.env.SMTP_HOST);
console.log('Port:', process.env.SMTP_PORT);
console.log('User:', process.env.SMTP_USER);

transporter.verify(function (error, success) {
    if (error) {
        console.log('Verification failed:', error);
    } else {
        console.log('Server is ready to take our messages');
    }
});
