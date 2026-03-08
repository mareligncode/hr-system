import { EmployeeDocument, EmployeeCertification, Employee, User } from '../models/index.js';
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
