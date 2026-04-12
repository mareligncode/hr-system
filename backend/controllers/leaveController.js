import { LeaveType, LeaveRequest, User, Employee, Department, LeaveBlackoutDate, LeaveBalance } from '../models/index.js';
import { Op } from 'sequelize';
import { logActivity } from '../services/auditService.js';
import { createNotification, notifyByRole } from '../services/notificationService.js';

// --- Leave Type Controllers ---

export const createLeaveType = async (req, res) => {
    try {
        const leaveType = await LeaveType.create({
            ...req.body,
            created_by: req.user.id
        });
        await logActivity(req.user.id, 'CREATE_LEAVE_TYPE', 'LeaveType', leaveType.id, null, leaveType.toJSON(), req);
        res.status(201).json(leaveType);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create leave type', details: error.message });
    }
};

export const getLeaveTypes = async (req, res) => {
    try {
        let leaveTypes = await LeaveType.findAll({
            where: { is_active: true }
        });

        // Auto-seed defaults if empty (Ensures a smooth first-time experience)
        if (leaveTypes.length === 0) {
            const defaults = [
                { name: 'Annual Leave', code: 'AL', days_per_year: 21, is_paid: true, applicable_gender: 'all' },
                { name: 'Sick Leave', code: 'SL', days_per_year: 15, is_paid: true, applicable_gender: 'all' },
                { name: 'Maternity Leave', code: 'ML', days_per_year: 90, is_paid: true, applicable_gender: 'female' },
                { name: 'Paternity Leave', code: 'PL', days_per_year: 5, is_paid: true, applicable_gender: 'male' }
            ];

            // Create defaults
            await Promise.all(defaults.map(type =>
                LeaveType.create({ ...type, created_by: req.user.id }).catch(() => null)
            ));

            // Fetch again
            leaveTypes = await LeaveType.findAll({ where: { is_active: true } });
        }

        res.status(200).json(leaveTypes);
    } catch (error) {
        console.error('Fetch Leave Types Error:', error);
        res.status(500).json({ error: 'Failed to fetch leave types' });
    }
};

// --- Leave Request Controllers ---

export const requestLeave = async (req, res) => {
    try {
        const userId = req.user.id;
        const employee = await Employee.findOne({ where: { user_id: userId } });
        if (!employee) return res.status(404).json({ error: 'Employee profile not found' });

        const { leave_type_id, start_date, end_date, reason, is_half_day, half_day_session } = req.body;

        // Validation
        if (!leave_type_id) {
            return res.status(400).json({ error: 'Leave Type is required' });
        }

        // Basic validation: end date after start date
        if (new Date(end_date) < new Date(start_date)) {
            return res.status(400).json({ error: 'End date cannot be before start date' });
        }

        // --- NEW: Blackout Date Check ---
        const blackoutDates = await LeaveBlackoutDate.findAll({
            where: {
                is_active: true,
                [Op.or]: [
                    {
                        start_date: { [Op.between]: [start_date, end_date] }
                    },
                    {
                        end_date: { [Op.between]: [start_date, end_date] }
                    },
                    {
                        [Op.and]: [
                            { start_date: { [Op.lte]: start_date } },
                            { end_date: { [Op.gte]: end_date } }
                        ]
                    }
                ],
                [Op.or]: [
                    { department_id: null },
                    { department_id: employee.department_id }
                ]
            }
        });

        if (blackoutDates.length > 0) {
            const names = blackoutDates.map(b => b.name).join(', ');
            return res.status(400).json({
                error: `Requested dates fall within a blackout period: ${names}. Leave is restricted during this time.`
            });
        }

        // --- NEW: Balance Check ---
        const currentYear = new Date().getFullYear();
        const balance = await LeaveBalance.findOne({
            where: {
                employee_id: userId,
                leave_type_id,
                year: currentYear
            }
        });

        // Calculate days
        const start = new Date(start_date);
        const end = new Date(end_date);
        let days = ((end - start) / (1000 * 60 * 60 * 24)) + 1;
        if (is_half_day) days = 0.5;

        if (balance && parseFloat(balance.balance) < days) {
            return res.status(400).json({ error: `Insufficient leave balance. Available: ${balance.balance} days.` });
        }

        // Generate a unique Request Number
        const datePart = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const randomPart = Math.floor(1000 + Math.random() * 9000);
        const requestNumber = `LR-${datePart}-${randomPart}`;

        const leaveRequest = await LeaveRequest.create({
            employee_id: userId,
            leave_type_id,
            request_number: requestNumber,
            start_date,
            end_date,
            return_date: end_date, // Default to end date for now
            days_requested: days,
            is_half_day,
            half_day_session,
            reason,
            status: 'pending'
        });

        await logActivity(userId, 'REQUEST_LEAVE', 'LeaveRequest', leaveRequest.id, null, leaveRequest.toJSON(), req);

        // 🔔 Notify HR/Admin about the new leave request
        const submitter = req.user;
        notifyByRole({
            roles: ['admin', 'hr'],
            title: '📋 New Leave Request',
            message: `${submitter.first_name || 'An employee'} ${submitter.last_name || ''} has submitted a new leave request (${days} day${days !== 1 ? 's' : ''}) from ${start_date} to ${end_date}.`,
            type: 'info',
            link: '/leave/approvals',
            relatedEntityType: 'LeaveRequest',
            relatedEntityId: leaveRequest.id
        }).catch(e => console.error('[Leave] HR notification failed:', e)); // fire quietly

        res.status(201).json({ message: 'Leave request submitted successfully', leaveRequest });
    } catch (error) {
        console.error('Leave Request Error:', error);
        res.status(500).json({ error: 'Failed to submit leave request', details: error.message });
    }
};

export const getMyLeaveRequests = async (req, res) => {
    try {
        const requests = await LeaveRequest.findAll({
            where: { employee_id: req.user.id },
            include: [{ model: LeaveType, attributes: ['name', 'code'] }],
            order: [['created_at', 'DESC']]
        });
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch your leave requests' });
    }
};

export const getPendingApprovals = async (req, res) => {
    try {
        let deptWhere = {};
        if (req.user.role === 'manager') {
            const manager = await Employee.findOne({ where: { user_id: req.user.id } });
            if (!manager) return res.status(404).json({ error: 'Manager profile not found' });
            deptWhere = { department_id: manager.department_id };
        }

        const requests = await LeaveRequest.findAll({
            where: { status: 'pending' },
            include: [
                { model: LeaveType, attributes: ['name'] },
                {
                    model: Employee,
                    attributes: ['user_id'],
                    include: [{
                        model: User,
                        attributes: ['first_name', 'last_name'],
                        required: true,
                        include: [{
                            model: Employee,
                            where: Object.keys(deptWhere).length > 0 ? deptWhere : undefined,
                            required: Object.keys(deptWhere).length > 0,
                            include: [{ model: Department, attributes: ['name'] }]
                        }]
                    }]
                }
            ],
            order: [['created_at', 'ASC']]
        });

        res.status(200).json(requests);
    } catch (error) {
        console.error('Pending Approvals Error:', error);
        res.status(500).json({ error: 'Failed to fetch pending approvals' });
    }
};

export const approveLeave = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, rejection_reason, comments } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const leaveRequest = await LeaveRequest.findByPk(id);
        if (!leaveRequest) return res.status(404).json({ error: 'Leave request not found' });

        await leaveRequest.update({
            status,
            rejection_reason: status === 'rejected' ? (rejection_reason || comments) : null,
            comments: comments || (status === 'rejected' ? rejection_reason : null),
            approved_by: req.user.id,
            approved_at: new Date()
        });

        // --- NEW: Update Leave Balance on Approval ---
        if (status === 'approved') {
            const currentYear = new Date(leaveRequest.start_date).getFullYear();
            const balance = await LeaveBalance.findOne({
                where: {
                    employee_id: leaveRequest.employee_id,
                    leave_type_id: leaveRequest.leave_type_id,
                    year: currentYear
                }
            });

            if (balance) {
                await balance.update({
                    used_days: parseFloat(balance.used_days) + parseFloat(leaveRequest.days_requested)
                });
            } else {
                // If no balance record exists, create one with the used days
                // (Though ideally balances should be initialized)
                await LeaveBalance.create({
                    employee_id: leaveRequest.employee_id,
                    leave_type_id: leaveRequest.leave_type_id,
                    year: currentYear,
                    accrued_days: 0,
                    used_days: leaveRequest.days_requested
                });
            }
        }

        await logActivity(req.user.id, `LEAVE_${status.toUpperCase()}`, 'LeaveRequest', id, null, { status, rejection_reason, comments }, req);

        // 🔔 Dispatch in-app notification (and email if user settings allow) to the employee
        const employeeUserId = leaveRequest.employee_id;
        const isApproved = status === 'approved';
        await createNotification({
            userId: employeeUserId,
            title: isApproved ? '✅ Leave Request Approved' : '❌ Leave Request Rejected',
            message: isApproved
                ? `Your leave request has been approved by ${req.user.first_name || 'HR'}.`
                : `Your leave request was rejected. Reason: ${rejection_reason || comments || 'No reason provided.'}`,
            type: isApproved ? 'info' : 'alert',
            link: '/leave/history',
            relatedEntityType: 'LeaveRequest',
            relatedEntityId: leaveRequest.id,
            sendEmailFlag: true,
            settingKey: 'notify_on_leave_status'
        });

        res.status(200).json({ message: `Leave request ${status} successfully` });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update leave request' });
    }
};
