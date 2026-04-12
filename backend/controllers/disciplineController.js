import { DisciplinaryRecord, Employee, User } from '../models/index.js';
import { logActivity } from '../services/auditService.js';
import { createNotification } from '../services/notificationService.js';

export const issueWarning = async (req, res) => {
    try {
        const { employee_id, incident_type, description, action_taken, incident_date } = req.body;

        const record = await DisciplinaryRecord.create({
            employee_id,
            incident_type,
            description,
            action_taken,
            incident_date,
            issued_by: req.user.id,
            status: 'open'
        });

        await logActivity(req.user.id, 'ISSUE_DISCIPLINARY', 'DisciplinaryRecord', record.id, null, record.toJSON(), req);

        await createNotification({
            userId: employee_id,
            title: '⚠️ Disciplinary Action Issued',
            message: `A formal ${action_taken.replace('_', ' ')} has been recorded in your profile.`,
            type: 'alert',
            link: '/my-records'
        });

        res.status(201).json(record);
    } catch (error) {
        res.status(500).json({ error: 'Failed to issue warning' });
    }
};

export const getDisciplinaryHistory = async (req, res) => {
    try {
        const { employee_id } = req.query;
        let where = {};
        if (employee_id) where.employee_id = employee_id;

        // If not admin/hr, only see own
        if (!['admin', 'hr'].includes(req.user.role)) {
            where.employee_id = req.user.id;
        }

        const records = await DisciplinaryRecord.findAll({
            where,
            include: [
                { model: Employee, include: [{ model: User, attributes: ['first_name', 'last_name'] }] },
                { model: User, as: 'Issuer', attributes: ['first_name', 'last_name'] }
            ],
            order: [['incident_date', 'DESC']]
        });
        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
};
