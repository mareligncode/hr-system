import { AuditLog, User } from '../models/index.js';
import ExcelJS from 'exceljs';

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

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Audit Logs');

        // Define columns
        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'User', key: 'user', width: 25 },
            { header: 'Action', key: 'action', width: 20 },
            { header: 'Model', key: 'model', width: 15 },
            { header: 'Model ID', key: 'model_id', width: 10 },
            { header: 'IP Address', key: 'ip_address', width: 20 },
            { header: 'Date & Time', key: 'created_at', width: 25 }
        ];

        // Style header row
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4F46E5' } // Indigo-600
        };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

        // Add data
        logs.forEach(log => {
            worksheet.addRow({
                id: log.id,
                user: log.User ? `${log.User.first_name} ${log.User.last_name}` : 'System',
                action: log.action,
                model: log.model,
                model_id: log.model_id,
                ip_address: log.ip_address || 'N/A',
                created_at: new Date(log.created_at).toLocaleString()
            });
        });

        // Alternating row colors
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1 && rowNumber % 2 === 0) {
                row.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFF9FAFB' } // Gray-50
                };
            }
            row.alignment = { vertical: 'middle' };
        });

        // Set response headers
        const fileName = `audit_logs_${new Date().toISOString().split('T')[0]}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

        await workbook.xlsx.write(res);
        res.status(200).end();
    } catch (error) {
        console.error('Audit Export Error:', error);
        res.status(500).json({ error: 'Failed to export logs' });
    }
};
