import { EmployeeDocument, EmployeeCertification, Employee, User, JobPosting } from '../models/index.js';
import { Op } from 'sequelize';
import { sendEmail } from './emailService.js';

/**
 * Scans for documents and certifications expiring within a specific window
 * and sends email notifications to the employee and their manager.
 */
export const checkAndNotifyExpiries = async (daysAhead = 30) => {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + daysAhead);

    console.log(`[ExpiryCheck] Scanning for items expiring before ${expiryDate.toDateString()}...`);

    try {
        // 1. Check Documents
        const expiringDocs = await EmployeeDocument.findAll({
            where: {
                expiry_date: {
                    [Op.between]: [new Date(), expiryDate]
                },
                reminder_sent: false
            },
            include: [{
                model: Employee,
                include: [
                    { model: User, attributes: ['first_name', 'last_name', 'email'] },
                    { model: User, as: 'Manager', attributes: ['first_name', 'last_name', 'email'] }
                ]
            }]
        });

        for (const doc of expiringDocs) {
            await sendExpiryEmail(doc, 'document');
            await doc.update({ reminder_sent: true });
        }

        // 2. Check Certifications
        const expiringCerts = await EmployeeCertification.findAll({
            where: {
                expiry_date: {
                    [Op.between]: [new Date(), expiryDate]
                },
                reminder_sent: false
            },
            include: [{
                model: Employee,
                include: [
                    { model: User, attributes: ['first_name', 'last_name', 'email'] },
                    { model: User, as: 'Manager', attributes: ['first_name', 'last_name', 'email'] }
                ]
            }]
        });

        for (const cert of expiringCerts) {
            await sendExpiryEmail(cert, 'certification');
            await cert.update({ reminder_sent: true });
        }

        return {
            docsNotified: expiringDocs.length,
            certsNotified: expiringCerts.length
        };
    } catch (error) {
        console.error('[ExpiryCheck] Error during scan:', error);
        throw error;
    }
};

const sendExpiryEmail = async (item, type) => {
    const employee = item.Employee;
    const manager = employee?.Manager;
    const name = type === 'document' ? item.document_name : item.name;
    const expiryStr = new Date(item.expiry_date).toLocaleDateString();

    const subject = `Action Required: ${type === 'document' ? 'Document' : 'Certification'} Expiring Soon`;

    const html = `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #e11d48;">Expiry Alert</h2>
            <p>Hello <strong>${employee.User.first_name}</strong>,</p>
            <p>This is an automated reminder that your ${type} <strong>"${name}"</strong> is set to expire on <strong>${expiryStr}</strong>.</p>
            <p>Please ensure you renew this record and upload the updated version to the HR portal as soon as possible.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #666;">This is an automated system notification from the Hotel HR Management System.</p>
        </div>
    `;

    try {
        // Send to employee
        await sendEmail({
            to: employee.User.email,
            subject,
            html
        });

        // Send to manager if exists
        if (manager?.email) {
            await sendEmail({
                to: manager.email,
                subject: `Team Alert: ${employee.User.first_name}'s ${type} is expiring`,
                html: html.replace(`Hello <strong>${employee.User.first_name}</strong>`, `Hi ${manager.first_name}, <br/><br/> This is to inform you that your subordinate <strong>${employee.User.first_name} ${employee.User.last_name}</strong> has a ${type} expiring.`)
            });
        }
    } catch (error) {
        console.error(`[ExpiryCheck] Failed to send email for ${type} ${item.id}:`, error);
    }
};

/**
 * Sends a confirmation email to the applicant after successful submission.
 */
export const sendApplicationConfirmation = async (application, applicant, posting) => {
    const subject = `Application Received: ${posting.title}`;
    const html = `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #2563eb;">Application Confirmation</h2>
            <p>Hello <strong>${applicant.first_name}</strong>,</p>
            <p>Thank you for applying for the <strong>${posting.title}</strong> position (Ref: ${posting.reference_code}) at our hotel.</p>
            <p>We have successfully received your application and resume. Our recruitment team will review your profile and get back to you if your qualifications match our requirements.</p>
            <p>Best regards,<br/>HR Department</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #666;">This is an automated system notification from the Hotel HR Management System.</p>
        </div>
    `;

    try {
        await sendEmail({
            to: applicant.email,
            subject,
            html
        });
    } catch (error) {
        console.error(`[Notification] Failed to send application confirmation to ${applicant.email}:`, error);
    }
};

/**
 * Notifies the job creator or HR about a new application.
 */
export const notifyHRofNewApplication = async (application, applicant, posting) => {
    const creator = posting.Creator;
    if (!creator || !creator.email) return;

    const subject = `New Application: ${posting.title}`;
    const html = `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #2563eb;">New Application Received</h2>
            <p>Hello ${creator.first_name},</p>
            <p>A new application has been submitted for your job posting: <strong>${posting.title}</strong>.</p>
            <p><strong>Applicant:</strong> ${applicant.first_name} ${applicant.last_name}</p>
            <p><strong>Email:</strong> ${applicant.email}</p>
            <p>You can view the full application details in the HR portal.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #666;">This is an automated system notification from the Hotel HR Management System.</p>
        </div>
    `;

    try {
        await sendEmail({
            to: creator.email,
            subject,
            html
        });
    } catch (error) {
        console.error(`[Notification] Failed to notify HR about new application for ${posting.title}:`, error);
    }
};

/**
 * Sends a status update email to the applicant.
 */
export const sendApplicationStatusUpdate = async (application, applicant, posting) => {
    const status = application.status;
    let subject = '';
    let message = '';
    let color = '#2563eb'; // Default blue

    switch (status) {
        case 'screening':
            subject = `Application Update: Screening Stage - ${posting.title}`;
            message = `Your application for <strong>${posting.title}</strong> has moved to the screening stage. Our team is currently reviewing your profile in more detail.`;
            break;
        case 'interview':
            subject = `Interview Invitation: ${posting.title}`;
            message = `We are pleased to invite you for an interview for the <strong>${posting.title}</strong> position. Our HR team will contact you shortly to schedule a convenient time.`;
            color = '#8b5cf6'; // Violet
            break;
        case 'offer':
            subject = `Great News: Job Offer for ${posting.title}`;
            message = `Congratulations! We are excited to extend a job offer to you for the <strong>${posting.title}</strong> position. Please check your dashboard for further details and next steps.`;
            color = '#10b981'; // Emerald
            break;
        case 'hired':
            subject = `Welcome to the Team! - ${posting.title}`;
            message = `Welcome aboard! We are thrilled to officially have you as part of our hospitality team for the <strong>${posting.title}</strong> role.`;
            color = '#059669'; // Dark emerald
            break;
        case 'rejected':
            subject = `Application Update: ${posting.title}`;
            message = `Thank you for your interest in the <strong>${posting.title}</strong> position. After careful consideration, we have decided to move forward with other candidates at this time. We wish you the best in your career search.`;
            color = '#ef4444'; // Red
            break;
        default:
            return; // No email for other statuses or if status is current
    }

    const html = `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: ${color};">Recruitment Update</h2>
            <p>Hello <strong>${applicant.first_name}</strong>,</p>
            <p>${message}</p>
            <p>You can track your application progress anytime on our careers portal.</p>
            <p>Best regards,<br/>Recruitment Team</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #666;">This is an automated system notification from the Hotel HR Management System.</p>
        </div>
    `;

    try {
        await sendEmail({
            to: applicant.email,
            subject,
            html
        });
    } catch (error) {
        console.error(`[Notification] Failed to send status update (${status}) to ${applicant.email}:`, error);
    }
};
