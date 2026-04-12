import { LeaveBlackoutDate, LeaveBalance, LeaveEncashment, LeaveType, Employee, User, Department } from '../models/index.js';
import { Op } from 'sequelize';
import { logActivity } from '../services/auditService.js';
import { createNotification, notifyByRole } from '../services/notificationService.js';

// --- Blackout Dates Controller ---

export const createBlackoutDate = async (req, res) => {
    try {
        const blackout = await LeaveBlackoutDate.create({
            ...req.body,
            created_by: req.user.id
        });
        await logActivity(req.user.id, 'CREATE_BLACKOUT_DATE', 'LeaveBlackoutDate', blackout.id, null, blackout.toJSON(), req);
        res.status(201).json(blackout);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create blackout date', details: error.message });
    }
};

export const getBlackoutDates = async (req, res) => {
    try {
        const blackouts = await LeaveBlackoutDate.findAll({
            include: [{ model: Department, attributes: ['name'] }],
            order: [['start_date', 'ASC']]
        });
        res.status(200).json(blackouts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch blackout dates' });
    }
};

export const deleteBlackoutDate = async (req, res) => {
    try {
        const { id } = req.params;
        const blackout = await LeaveBlackoutDate.findByPk(id);
        if (!blackout) return res.status(404).json({ error: 'Blackout date not found' });

        await blackout.destroy();
        await logActivity(req.user.id, 'DELETE_BLACKOUT_DATE', 'LeaveBlackoutDate', id, blackout.toJSON(), null, req);
        res.status(200).json({ message: 'Blackout date deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete blackout date' });
    }
};

// --- Accrual Engine ---

export const runAccrual = async (req, res) => {
    try {
        const employees = await Employee.findAll({ include: [{ model: User, attributes: ['id', 'email'] }] });
        const leaveTypes = await LeaveType.findAll({ where: { is_active: true } });
        const currentYear = new Date().getFullYear();

        let accrualResults = [];

        for (const employee of employees) {
            for (const type of leaveTypes) {
                // Simplified Accrual Logic: 1/12 of annual days per month
                // Only if employee has been active for over 1 month (can be more complex based on Phase 2 requirements)
                const monthlyAccrual = parseFloat(type.days_per_year) / 12;

                let [balance, created] = await LeaveBalance.findOrCreate({
                    where: {
                        employee_id: employee.user_id,
                        leave_type_id: type.id,
                        year: currentYear
                    },
                    defaults: {
                        accrued_days: 0,
                        carried_forward: 0,
                        used_days: 0,
                        encashed_days: 0
                    }
                });

                const oldAccrued = parseFloat(balance.accrued_days);
                const newAccrued = oldAccrued + monthlyAccrual;

                await balance.update({
                    accrued_days: newAccrued,
                    last_accrual_date: new Date()
                });

                accrualResults.push({ employee: employee.user_id, leaveType: type.name, added: monthlyAccrual });
            }
        }

        res.status(200).json({ message: 'Accrual engine run successfully', resultsCount: accrualResults.length });
    } catch (error) {
        console.error('Accrual Engine Error:', error);
        res.status(500).json({ error: 'Accrual engine failed', details: error.message });
    }
};

// --- Leave Encashment ---

export const requestEncashment = async (req, res) => {
    try {
        const { leave_type_id, days_to_encash, amount_per_day, comments } = req.body;
        const userId = req.user.id;

        const balance = await LeaveBalance.findOne({
            where: {
                employee_id: userId,
                leave_type_id,
                year: new Date().getFullYear()
            }
        });

        if (!balance || parseFloat(balance.balance) < parseFloat(days_to_encash)) {
            return res.status(400).json({ error: 'Insufficient leave balance for encashment' });
        }

        const total_amount = parseFloat(days_to_encash) * parseFloat(amount_per_day);

        const encashment = await LeaveEncashment.create({
            employee_id: userId,
            leave_type_id,
            days_to_encash,
            amount_per_day,
            total_amount,
            comments,
            status: 'pending'
        });

        await logActivity(userId, 'REQUEST_ENCASHMENT', 'LeaveEncashment', encashment.id, null, encashment.toJSON(), req);

        notifyByRole({
            roles: ['admin', 'hr', 'finance'],
            title: '💰 New Encashment Request',
            message: `${req.user.first_name || 'An employee'} has requested to encash ${days_to_encash} days for ${total_amount}.`,
            type: 'info',
            link: '/leave/encashments',
            relatedEntityType: 'LeaveEncashment',
            relatedEntityId: encashment.id
        }).catch(e => console.error('[Encashment] Notification failed:', e));

        res.status(201).json(encashment);
    } catch (error) {
        res.status(500).json({ error: 'Failed to request encashment', details: error.message });
    }
};

export const getEncashmentRequests = async (req, res) => {
    try {
        let where = {};
        if (req.query.status) where.status = req.query.status;

        // Security: If not admin/hr/finance, only show own requests
        const isInternalRecordUser = ['admin', 'hr', 'finance'].includes(req.user.role);
        if (!isInternalRecordUser) {
            where.employee_id = req.user.id;
        }

        const requests = await LeaveEncashment.findAll({
            where,
            include: [
                { model: LeaveType, attributes: ['name'] },
                {
                    model: Employee,
                    include: [{ model: User, attributes: ['first_name', 'last_name'] }]
                }
            ],
            order: [['created_at', 'DESC']]
        });
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch encashment requests' });
    }
};

export const approveEncashment = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, rejection_reason, comments } = req.body;

        const request = await LeaveEncashment.findByPk(id);
        if (!request) return res.status(404).json({ error: 'Request not found' });

        if (status === 'approved') {
            // Deduct from balance
            const balance = await LeaveBalance.findOne({
                where: {
                    employee_id: request.employee_id,
                    leave_type_id: request.leave_type_id,
                    year: new Date().getFullYear()
                }
            });

            if (balance) {
                await balance.update({
                    encashed_days: parseFloat(balance.encashed_days) + parseFloat(request.days_to_encash)
                });
            }
        }

        await request.update({
            status,
            rejection_reason,
            comments,
            approved_by: req.user.id,
            approved_at: new Date()
        });

        await logActivity(req.user.id, `ENCASHment_${status.toUpperCase()}`, 'LeaveEncashment', id, null, { status }, req);

        await createNotification({
            userId: request.employee_id,
            title: status === 'approved' ? '💰 Encashment Approved' : '❌ Encashment Rejected',
            message: status === 'approved'
                ? `Your encashment request for ${request.days_to_encash} days has been approved.`
                : `Your encashment request was rejected.`,
            type: status === 'approved' ? 'success' : 'alert',
            link: '/leave/history'
        });

        res.status(200).json({ message: `Encashment request ${status}` });
    } catch (error) {
        res.status(500).json({ error: 'Failed to process encashment' });
    }
};

export const getMyLeaveBalances = async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();
        const balances = await LeaveBalance.findAll({
            where: {
                employee_id: req.user.id,
                year: currentYear
            },
            include: [{ model: LeaveType, attributes: ['name', 'code', 'days_per_year'] }]
        });
        res.status(200).json(balances);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch your leave balances' });
    }
};
