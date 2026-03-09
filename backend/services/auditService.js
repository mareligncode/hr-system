import { AuditLog, User } from '../models/index.js';

export const logActivity = async (userId, action, model, modelId, oldValues = null, newValues = null, req = null) => {
    try {
        await AuditLog.create({
            user_id: userId,
            action,
            model,
            model_id: modelId,
            old_values: oldValues,
            new_values: newValues,
            ip_address: req ? req.ip : null,
            user_agent: req ? req.get('User-Agent') : null
        });
    } catch (error) {
        console.error('Audit Log Error:', error);
    }
};

export const getAuditLogs = async (req, res) => {
    try {
        const { model, user_id, page = 1, limit = 15 } = req.query;
        const where = {};
        if (model) where.model = model;
        if (user_id) where.user_id = user_id;

        const offset = (page - 1) * limit;

        const { count, rows } = await AuditLog.findAndCountAll({
            where,
            include: [{ model: User, attributes: ['first_name', 'last_name', 'email'] }],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
        
        res.status(200).json({
            logs: rows,
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / limit)
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
};

export const exportAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog.findAll({
            include: [{ model: User, attributes: ['first_name', 'last_name', 'email'] }],
            order: [['created_at', 'DESC']]
        });

        // Simple CSV generation
        const header = 'ID,User,Action,Model,ModelID,IP,Date\n';
        const rows = logs.map(log => {
            const userName = log.User ? `${log.User.first_name} ${log.User.last_name}` : 'System';
            return `${log.id},"${userName}",${log.action},${log.model},${log.model_id},${log.ip_address},${log.created_at}`;
        }).join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=audit_logs.csv');
        res.status(200).send(header + rows);
    } catch (error) {
        res.status(500).json({ error: 'Failed to export logs' });
    }
};
