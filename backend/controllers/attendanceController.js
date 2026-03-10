import { Attendance, AttendanceCorrection, User, Employee, Department } from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import { logActivity } from '../services/auditService.js';

const calculateHours = (start, end) => {
    if (!start || !end) return 0;
    const diffMs = new Date(end) - new Date(start);
    const diffHrs = diffMs / (1000 * 60 * 60);
    return Math.max(0, parseFloat(diffHrs.toFixed(2)));
};

export const clockIn = async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existingRecord = await Attendance.findOne({
            where: {
                user_id: userId,
                clock_in: { [Op.gte]: today },
                clock_out: null
            }
        });

        if (existingRecord) {
            return res.status(400).json({ error: 'You are already clocked in.' });
        }

        const { location, selfie_url, timestamp } = req.body;
        const ip_address = req.ip || req.headers['x-forwarded-for'];
        const clockInTime = timestamp ? new Date(timestamp) : new Date();

        const attendance = await Attendance.create({
            user_id: userId,
            clock_in: clockInTime,
            location_in: location || null,
            selfie_in: selfie_url || null,
            ip_address: ip_address
        });

        await logActivity(userId, 'CLOCK_IN', 'Attendance', attendance.id, null, attendance.toJSON(), req);

        res.status(201).json({ message: 'Clocked in successfully', attendance });
    } catch (error) {
        console.error('Clock In Error:', error);
        res.status(500).json({ error: 'Failed to clock in', details: error.message });
    }
};

export const clockOut = async (req, res) => {
    try {
        const userId = req.user.id;

        const attendance = await Attendance.findOne({
            where: { user_id: userId, clock_out: null },
            order: [['clock_in', 'DESC']]
        });

        if (!attendance) {
            return res.status(400).json({ error: 'No active clock-in session found.' });
        }

        const { location, selfie_url, timestamp } = req.body;
        const clockOutTime = timestamp ? new Date(timestamp) : new Date();
        const hours = calculateHours(attendance.clock_in, clockOutTime);

        const workHours = Math.min(hours, 8);
        const overtimeHours = Math.max(0, hours - 8);

        await attendance.update({
            clock_out: clockOutTime,
            work_hours: workHours,
            overtime_hours: overtimeHours,
            location_out: location || null,
            selfie_out: selfie_url || null
        });

        await logActivity(userId, 'CLOCK_OUT', 'Attendance', attendance.id, null, attendance.toJSON(), req);

        res.status(200).json({ message: 'Clocked out successfully', attendance });
    } catch (error) {
        console.error('Clock Out Error:', error);
        res.status(500).json({ error: 'Failed to clock out', details: error.message });
    }
};

export const getMyAttendance = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        const whereClause = { user_id: req.user.id };

        if (start_date && end_date) {
            whereClause.clock_in = {
                [Op.between]: [new Date(start_date), new Date(end_date)]
            };
        }

        const history = await Attendance.findAll({
            where: whereClause,
            order: [['clock_in', 'DESC']]
        });

        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch attendance history' });
    }
};

export const getTodayAttendance = async (req, res) => {
    const today = new Date();
    req.query.date = today.toISOString().split('T')[0];
    return getTeamAttendance(req, res);
};

export const getTeamAttendance = async (req, res) => {
    try {
        let deptWhere = {};

        if (req.user.role === 'manager') {
            const manager = await Employee.findOne({ where: { user_id: req.user.id } });
            if (!manager) return res.status(404).json({ error: 'Manager profile not found' });
            deptWhere = { department_id: manager.department_id };
        } else if (req.user.role !== 'admin' && req.user.role !== 'hr') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const { date, department_id } = req.query;
        const targetDate = date ? new Date(date) : new Date();
        targetDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);

        if ((req.user.role === 'admin' || req.user.role === 'hr') && department_id) {
            deptWhere = { department_id };
        }

        const attendance = await Attendance.findAll({
            where: { clock_in: { [Op.between]: [targetDate, nextDay] } },
            include: [{
                model: User,
                attributes: ['first_name', 'last_name', 'email'],
                required: true,
                include: [{
                    model: Employee,
                    where: Object.keys(deptWhere).length > 0 ? deptWhere : undefined,
                    required: Object.keys(deptWhere).length > 0,
                    include: [{ model: Department, attributes: ['name'] }]
                }]
            }],
            order: [['clock_in', 'DESC']]
        });

        res.status(200).json(attendance);
    } catch (error) {
        console.error('Team Attendance Error:', error);
        res.status(500).json({ error: 'Failed to fetch team attendance' });
    }
};

export const approveAttendance = async (req, res) => {
    try {
        const { id } = req.params;
        const status = req.body.status || req.presetStatus;
        const { comment } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Status must be approved or rejected' });
        }

        const attendance = await Attendance.findByPk(id);
        if (!attendance) return res.status(404).json({ error: 'Record not found' });

        await attendance.update({ status, verified_by: req.user.id });

        if (comment) {
            await AttendanceCorrection.update(
                { status, manager_comment: comment, approved_by: req.user.id },
                { where: { attendance_id: id, status: 'pending' } }
            );
        }

        await logActivity(req.user.id, `${status.toUpperCase()}_ATTENDANCE`, 'Attendance', id, null, { status, comment }, req);

        res.status(200).json({ message: `Attendance ${status} successfully` });
    } catch (error) {
        console.error('Approve Attendance Error:', error);
        res.status(500).json({ error: 'Failed to update attendance status' });
    }
};

// ─── Request Correction ───────────────────────────────────────────────────────
export const requestCorrection = async (req, res) => {
    try {
        const { attendance_id, requested_clock_in, requested_clock_out, reason } = req.body;

        const correction = await AttendanceCorrection.create({
            user_id: req.user.id,
            attendance_id: attendance_id || null,
            requested_clock_in,
            requested_clock_out,
            reason
        });

        res.status(201).json({ message: 'Correction request submitted', correction });
    } catch (error) {
        console.error('Correction Error:', error);
        res.status(500).json({ error: 'Failed to submit correction request' });
    }
};

// ─── Approve / Reject Correction ──────────────────────────────────────────────
export const approveCorrection = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, comment } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Status must be approved or rejected' });
        }

        const correction = await AttendanceCorrection.findByPk(id);
        if (!correction) return res.status(404).json({ error: 'Correction not found' });

        await correction.update({
            status,
            manager_comment: comment || null,
            approved_by: req.user.id
        });

        // If approved, also update the parent attendance record's status
        if (status === 'approved' && correction.attendance_id) {
            await Attendance.update(
                {
                    clock_in: correction.requested_clock_in || sequelize.col('clock_in'),
                    clock_out: correction.requested_clock_out || sequelize.col('clock_out'),
                    status: 'approved',
                    verified_by: req.user.id
                },
                { where: { id: correction.attendance_id } }
            );
        }

        await logActivity(req.user.id, `${status.toUpperCase()}_CORRECTION`, 'AttendanceCorrection', id, null, { status, comment }, req);

        res.status(200).json({ message: `Correction ${status} successfully` });
    } catch (error) {
        console.error('Approve Correction Error:', error);
        res.status(500).json({ error: 'Failed to update correction status' });
    }
};

export const getAttendanceSummary = async (req, res) => {
    try {
        const userId = req.user.id;
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        startOfWeek.setHours(0, 0, 0, 0);

        const attendance = await Attendance.findAll({
            where: { user_id: userId, clock_in: { [Op.gte]: startOfWeek } }
        });

        const totalHours = attendance.reduce((sum, a) => sum + (a.work_hours || 0), 0);
        const totalOvertime = attendance.reduce((sum, a) => sum + (a.overtime_hours || 0), 0);
        const daysPresent = new Set(attendance.map(a => new Date(a.clock_in).toISOString().split('T')[0])).size;

        res.status(200).json({
            totalHours: totalHours.toFixed(1),
            totalOvertime: totalOvertime.toFixed(1),
            daysPresent,
            thisWeek: attendance
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch summary' });
    }
};

export const getCorrectionRequests = async (req, res) => {
    try {
        let deptWhere = {};
        if (req.user.role === 'manager') {
            const manager = await Employee.findOne({ where: { user_id: req.user.id } });
            if (!manager) return res.status(404).json({ error: 'Manager profile not found' });
            deptWhere = { department_id: manager.department_id };
        }

        const corrections = await AttendanceCorrection.findAll({
            include: [{
                model: User,
                attributes: ['first_name', 'last_name', 'email'],
                required: true,
                include: [{
                    model: Employee,
                    where: Object.keys(deptWhere).length > 0 ? deptWhere : undefined,
                    required: Object.keys(deptWhere).length > 0,
                    include: [{ model: Department, attributes: ['name'] }]
                }]
            }],
            order: [['created_at', 'DESC']]
        });

        res.status(200).json(corrections);
    } catch (error) {
        console.error('Correction Requests Error:', error);
        res.status(500).json({ error: 'Failed to fetch correction requests' });
    }
};

export const getAttendanceReports = async (req, res) => {
    try {
        const { start_date, end_date, department_id } = req.query;

        let deptWhere = {};
        if (req.user.role === 'manager') {
            const manager = await Employee.findOne({ where: { user_id: req.user.id } });
            if (!manager) return res.status(404).json({ error: 'Manager profile not found' });
            deptWhere = { department_id: manager.department_id };
        } else if (department_id) {
            deptWhere = { department_id };
        }

        let startDate = start_date ? new Date(start_date) : new Date(new Date().setDate(1)); // First of month
        let endDate = end_date ? new Date(end_date) : new Date();
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        const records = await Attendance.findAll({
            where: { clock_in: { [Op.between]: [startDate, endDate] } },
            include: [{
                model: User,
                attributes: ['id', 'first_name', 'last_name', 'email'],
                required: true,
                include: [{
                    model: Employee,
                    attributes: ['employee_number', 'department_id'],
                    where: Object.keys(deptWhere).length > 0 ? deptWhere : undefined,
                    required: Object.keys(deptWhere).length > 0,
                    include: [
                        { model: Department, attributes: ['name'] },
                    ]
                }]
            }]
        });

        const employeeMap = {};
        records.forEach(a => {
            const user = a.User;
            if (!user) return;
            const uid = user.id;
            if (!employeeMap[uid]) {
                employeeMap[uid] = {
                    userId: uid,
                    name: `${user.first_name} ${user.last_name}`,
                    email: user.email,
                    employeeNumber: user.Employee?.employee_number || '-',
                    department: user.Employee?.Department?.name || '-',
                    totalDays: 0,
                    totalHours: 0,
                    totalOvertime: 0,
                    approvedDays: 0,
                    pendingDays: 0
                };
            }
            employeeMap[uid].totalDays += 1;
            employeeMap[uid].totalHours += a.work_hours || 0;
            employeeMap[uid].totalOvertime += a.overtime_hours || 0;
            if (a.status === 'approved') employeeMap[uid].approvedDays += 1;
            if (a.status === 'pending') employeeMap[uid].pendingDays += 1;
        });

        const employees = Object.values(employeeMap).map(e => ({
            ...e,
            totalHours: parseFloat(e.totalHours.toFixed(1)),
            totalOvertime: parseFloat(e.totalOvertime.toFixed(1))
        }));

        // Totals
        const totalHours = employees.reduce((sum, e) => sum + e.totalHours, 0);
        const totalOvertime = employees.reduce((sum, e) => sum + e.totalOvertime, 0);
        const totalRecords = records.length;

        res.status(200).json({
            period: { startDate, endDate },
            totals: {
                records: totalRecords,
                employees: employees.length,
                hours: parseFloat(totalHours.toFixed(1)),
                overtime: parseFloat(totalOvertime.toFixed(1))
            },
            employees
        });
    } catch (error) {
        console.error('Attendance Reports Error:', error);
        res.status(500).json({ error: 'Failed to generate attendance report' });
    }
};

export const exportAttendance = async (req, res) => {
    try {
        const { start_date, end_date, date } = req.query;
        const role = req.user.role;
        let deptWhere = {};
        let selfOnly = false;

        if (role === 'employee') {
            selfOnly = true;
        } else if (role === 'manager') {
            const manager = await Employee.findOne({ where: { user_id: req.user.id } });
            if (!manager) return res.status(404).json({ error: 'Manager profile not found' });
            deptWhere = { department_id: manager.department_id };
        }

        let startDate = start_date ? new Date(start_date) : new Date('2000-01-01');
        let endDate = end_date ? new Date(end_date) : new Date('2100-01-01');

        if (date) {
            startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
        }

        const queryOptions = {
            where: { clock_in: { [Op.between]: [startDate, endDate] } },
            include: [{
                model: User,
                attributes: ['first_name', 'last_name', 'email'],
                required: true,
                include: [{
                    model: Employee,
                    attributes: ['employee_number'],
                    required: false,
                    include: [{
                        model: Department,
                        attributes: ['name'],
                        required: false
                    }]
                }]
            }],
            order: [['clock_in', 'DESC']]
        };

        if (selfOnly) {
            queryOptions.where.user_id = req.user.id;
        } else if (Object.keys(deptWhere).length > 0) {
            queryOptions.include[0].include[0].where = deptWhere;
            queryOptions.include[0].include[0].required = true;
        }

        const attendance = await Attendance.findAll(queryOptions);

        const escapeCSV = (val) => {
            if (val === null || val === undefined) return '';
            const str = String(val);
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        const headers = [
            'Employee ID', 'Name', 'Department', 'Email',
            'Date', 'Clock In', 'Clock Out',
            'Work Hours', 'Overtime', 'Status',
            'GPS In (Lat)', 'GPS In (Lng)',
            'GPS Out (Lat)', 'GPS Out (Lng)',
            'Selfie (Clock In)', 'Selfie (Clock Out)'
        ];

        let csv = headers.join(',') + '\n';

        attendance.forEach(a => {
            const user = a.User;
            if (!user) return;
            const emp = user.Employee;
            const dateStr = a.clock_in ? new Date(a.clock_in).toISOString().split('T')[0] : '';
            const inTime = a.clock_in ? new Date(a.clock_in).toTimeString().slice(0, 5) : '';
            const outTime = a.clock_out ? new Date(a.clock_out).toTimeString().slice(0, 5) : '';
            const locIn = a.location_in || {};
            const locOut = a.location_out || {};

            const row = [
                escapeCSV(emp?.employee_number),
                escapeCSV(`${user.first_name || ''} ${user.last_name || ''}`.trim()),
                escapeCSV(emp?.Department?.name || 'MANAGEMENT'),
                escapeCSV(user.email),
                escapeCSV(dateStr),
                escapeCSV(inTime),
                escapeCSV(outTime),
                escapeCSV(a.work_hours || 0),
                escapeCSV(a.overtime_hours || 0),
                escapeCSV(a.status),
                escapeCSV(locIn.lat ?? ''),
                escapeCSV(locIn.lng ?? ''),
                escapeCSV(locOut.lat ?? ''),
                escapeCSV(locOut.lng ?? ''),
                escapeCSV(a.selfie_in || ''),
                escapeCSV(a.selfie_out || ''),
            ];

            csv += row.join(',') + '\n';
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=attendance_report.csv');
        res.status(200).send(csv);
    } catch (error) {
        console.error('Export Error:', error);
        res.status(500).json({ error: 'Failed to export attendance data' });
    }
};
