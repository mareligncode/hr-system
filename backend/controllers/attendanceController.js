import { Attendance, AttendanceCorrection, AttendanceBreak, User, Employee, Department } from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import { logActivity } from '../services/auditService.js';
import ExcelJS from 'exceljs';
import https from 'https';
import http from 'http';

import { calculateDistance } from '../utils/geoUtils.js';

const getImageBuffer = (url) => {
    if (!url) return null;
    const fetchUrl = url.startsWith('http') ? url : `https:${url}`;
    const protocol = fetchUrl.startsWith('https') ? https : http;

    return new Promise((resolve) => {
        const request = protocol.get(fetchUrl, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302) {
                // Handle redirect
                return resolve(getImageBuffer(res.headers.location));
            }
            if (res.statusCode !== 200) {
                console.error(`Image Fetch Error: Status ${res.statusCode} for ${fetchUrl}`);
                resolve(null);
                return;
            }
            const data = [];
            res.on('data', (chunk) => data.push(chunk));
            res.on('end', () => resolve(Buffer.concat(data)));
        });
        request.on('error', (err) => {
            console.error('Image Fetch Error:', err.message);
            resolve(null);
        });
        request.setTimeout(10000, () => {
            request.destroy();
            resolve(null);
        });
    });
};

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

        // Geofencing Check
        const employee = await Employee.findOne({
            where: { user_id: userId },
            include: [{ model: Department }]
        });

        if (employee && employee.Department && employee.Department.is_geofencing_enabled) {
            const dept = employee.Department;
            if (!location || !location.lat || !location.lng) {
                return res.status(400).json({ error: 'Location data is required for clock-in in your department.' });
            }

            const distance = calculateDistance(
                location.lat,
                location.lng,
                parseFloat(dept.latitude),
                parseFloat(dept.longitude)
            );

            if (distance > dept.radius_meters) {
                return res.status(403).json({
                    error: `You are too far from your department location (${Math.round(distance)}m). Required radius: ${dept.radius_meters}m.`
                });
            }
        }

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

        // Geofencing Check for Clock Out
        const employee = await Employee.findOne({
            where: { user_id: userId },
            include: [{ model: Department }]
        });

        if (employee && employee.Department && employee.Department.is_geofencing_enabled) {
            const dept = employee.Department;
            if (location && location.lat && location.lng) {
                const distance = calculateDistance(
                    location.lat,
                    location.lng,
                    parseFloat(dept.latitude),
                    parseFloat(dept.longitude)
                );

                if (distance > dept.radius_meters) {
                    return res.status(403).json({
                        error: `You are too far from your department location to clock out (${Math.round(distance)}m). Required radius: ${dept.radius_meters}m.`
                    });
                }
            }
        }

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
            include: [{ model: AttendanceBreak }],
            order: [['clock_in', 'DESC']]
        });

        res.status(200).json(history);
    } catch (error) {
        console.error('Get My Attendance Error:', error);
        res.status(500).json({ error: 'Failed to fetch attendance history', details: error.message });
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

        await attendance.update({
            status,
            verified_by: req.user.id,
            admin_comment: comment || null
        });

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
                    verified_by: req.user.id,
                    admin_comment: correction.manager_comment || null
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
            where: { user_id: userId, clock_in: { [Op.gte]: startOfWeek } },
            include: [{ model: AttendanceBreak }]
        });

        const totalHours = attendance.reduce((sum, a) => sum + (parseFloat(a.work_hours) || 0), 0);
        const totalOvertime = attendance.reduce((sum, a) => sum + (parseFloat(a.overtime_hours) || 0), 0);

        const daysPresent = new Set(
            attendance
                .filter(a => a.clock_in)
                .map(a => {
                    try {
                        const d = new Date(a.clock_in);
                        return d instanceof Date && !isNaN(d) ? d.toISOString().split('T')[0] : null;
                    } catch (e) {
                        return null;
                    }
                })
                .filter(d => d !== null)
        ).size;

        res.status(200).json({
            totalHours: totalHours.toFixed(1),
            totalOvertime: totalOvertime.toFixed(1),
            daysPresent,
            thisWeek: attendance
        });
    } catch (error) {
        console.error('Get Attendance Summary Error:', error);
        res.status(500).json({ error: 'Failed to fetch summary', details: error.message });
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

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Attendance Report');

        // Define columns
        worksheet.columns = [
            { header: 'Employee ID', key: 'eid', width: 15 },
            { header: 'Name', key: 'name', width: 25 },
            { header: 'Department', key: 'dept', width: 25 },
            { header: 'Date', key: 'date', width: 15 },
            { header: 'Clock In', key: 'in', width: 12 },
            { header: 'Clock Out', key: 'out', width: 12 },
            { header: 'Work Hours', key: 'hours', width: 12 },
            { header: 'Status', key: 'status', width: 12 },
            { header: 'Selfie In', key: 'selfie_in', width: 25 },
            { header: 'Selfie Out', key: 'selfie_out', width: 25 },
            { header: 'GPS In', key: 'gps_in', width: 25 },
            { header: 'GPS Out', key: 'gps_out', width: 25 }
        ];

        // Explicitly set headers to prevent any shifting issues
        worksheet.getRow(1).values = [
            'Employee ID', 'Name', 'Department', 'Date',
            'Clock In', 'Clock Out', 'Work Hours', 'Status',
            'Selfie In', 'Selfie Out', 'GPS In', 'GPS Out'
        ];

        // Style header row
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF0D9488' } // Teal-600
        };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
        headerRow.height = 30;

        // Add data and handle images
        for (let i = 0; i < attendance.length; i++) {
            const a = attendance[i];
            const user = a.User;
            const emp = user?.Employee;
            const rowNumber = i + 2;
            const row = worksheet.getRow(rowNumber);

            const clockInDate = new Date(a.clock_in);
            const dateStr = a.clock_in ? clockInDate.toISOString().split('T')[0] : '';
            const inTime = a.clock_in ? clockInDate.toTimeString().slice(0, 5) : '-';
            const outTime = a.clock_out ? new Date(a.clock_out).toTimeString().slice(0, 5) : '-';

            // Base data
            try {
                row.values = {
                    eid: emp?.employee_number || '-',
                    name: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'Unknown',
                    dept: emp?.Department?.name || 'MANAGEMENT',
                    date: dateStr,
                    in: inTime,
                    out: outTime,
                    hours: a.work_hours || 0,
                    status: (a.status || 'pending').toUpperCase(),
                    selfie_in: '', // Placeholder for images
                    selfie_out: '',
                    gps_in: 'No GPS',
                    gps_out: 'No GPS'
                };

                // Embedded Images (Now in Cols 9 & 10)
                row.height = 85;

                if (a.selfie_in) {
                    try {
                        const bufferIn = await getImageBuffer(a.selfie_in);
                        if (bufferIn && bufferIn.length > 0) {
                            let ext = a.selfie_in.split('.').pop().split('?')[0].toLowerCase();
                            // ExcelJS only supports 'jpeg', 'png', 'gif'
                            if (ext === 'jpg') ext = 'jpeg';
                            if (!['jpeg', 'png', 'gif'].includes(ext)) ext = 'jpeg';

                            const imageId = workbook.addImage({
                                buffer: bufferIn,
                                extension: ext,
                            });
                            worksheet.addImage(imageId, {
                                tl: { col: 8, row: rowNumber - 1 },
                                ext: { width: 80, height: 80 },
                                editAs: 'oneCell'
                            });
                            row.getCell('selfie_in').value = '';
                        } else {
                            row.getCell('selfie_in').value = 'No Image';
                        }
                    } catch (imgErr) {
                        console.error('Error adding selfie_in to excel:', imgErr.message);
                        row.getCell('selfie_in').value = 'Format Error';
                    }
                }

                if (a.selfie_out) {
                    try {
                        const bufferOut = await getImageBuffer(a.selfie_out);
                        if (bufferOut && bufferOut.length > 0) {
                            let ext = a.selfie_out.split('.').pop().split('?')[0].toLowerCase();
                            if (ext === 'jpg') ext = 'jpeg';
                            if (!['jpeg', 'png', 'gif'].includes(ext)) ext = 'jpeg';

                            const imageId = workbook.addImage({
                                buffer: bufferOut,
                                extension: ext,
                            });
                            worksheet.addImage(imageId, {
                                tl: { col: 9, row: rowNumber - 1 },
                                ext: { width: 80, height: 80 },
                                editAs: 'oneCell'
                            });
                            row.getCell('selfie_out').value = '';
                        } else {
                            row.getCell('selfie_out').value = 'No Image';
                        }
                    } catch (imgErr) {
                        console.error('Error adding selfie_out to excel:', imgErr.message);
                        row.getCell('selfie_out').value = 'Format Error';
                    }
                }

                // GPS Links (Now in Cols 11 & 12)
                if (a.location_in && typeof a.location_in === 'object') {
                    const { lat, lng } = a.location_in;
                    if (lat && lng && lat !== 0 && lng !== 0) {
                        row.getCell('gps_in').value = {
                            text: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
                            hyperlink: `https://www.google.com/maps?q=${lat},${lng}`
                        };
                        row.getCell('gps_in').font = { color: { argb: 'FF3B82F6' }, underline: true };
                    } else {
                        row.getCell('gps_in').value = 'Location Error (0,0)';
                    }
                }

                if (a.location_out && typeof a.location_out === 'object') {
                    const { lat, lng } = a.location_out;
                    if (lat && lng && lat !== 0 && lng !== 0) {
                        row.getCell('gps_out').value = {
                            text: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
                            hyperlink: `https://www.google.com/maps?q=${lat},${lng}`
                        };
                        row.getCell('gps_out').font = { color: { argb: 'FF3B82F6' }, underline: true };
                    } else {
                        row.getCell('gps_out').value = 'Location Error (0,0)';
                    }
                }
            } catch (rowErr) {
                console.error(`Error processing attendance row ${i}:`, rowErr.message);
            }

            // Center all cells in row
            row.alignment = { vertical: 'middle', horizontal: 'center' };
        }

        // Set response headers
        const fileName = `attendance_report_${new Date().toISOString().split('T')[0]}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

        await logActivity(req.user.id, 'EXPORT', 'Attendance', null, null, { recordCount: attendance.length }, req);

        await workbook.xlsx.write(res);
        res.status(200).end();
    } catch (error) {
        console.error('Export Error:', error);
        res.status(500).json({ error: 'Failed to export attendance data' });
    }
};

// ─── Break Management ────────────────────────────────────────────────────────
export const startBreak = async (req, res) => {
    try {
        const userId = req.user.id;
        const { type, notes } = req.body;

        // Must be clocked in
        const attendance = await Attendance.findOne({
            where: { user_id: userId, clock_out: null },
            order: [['clock_in', 'DESC']]
        });

        if (!attendance) {
            return res.status(400).json({ error: 'You must be clocked in to start a break.' });
        }

        // Must not be already on a break
        const existingBreak = await AttendanceBreak.findOne({
            where: { attendance_id: attendance.id, end_time: null }
        });

        if (existingBreak) {
            return res.status(400).json({ error: 'You are already on a break.' });
        }

        const attnBreak = await AttendanceBreak.create({
            attendance_id: attendance.id,
            type: type || 'lunch',
            start_time: new Date(),
            notes: notes || null
        });

        await logActivity(userId, 'START_BREAK', 'AttendanceBreak', attnBreak.id, null, attnBreak.toJSON(), req);

        res.status(201).json({ message: 'Break started', break: attnBreak });
    } catch (error) {
        console.error('Start Break Error:', error);
        res.status(500).json({ error: 'Failed to start break' });
    }
};

export const endBreak = async (req, res) => {
    try {
        const userId = req.user.id;

        const attendance = await Attendance.findOne({
            where: { user_id: userId, clock_out: null },
            order: [['clock_in', 'DESC']]
        });

        if (!attendance) {
            return res.status(400).json({ error: 'No active clock-in session found.' });
        }

        const attnBreak = await AttendanceBreak.findOne({
            where: { attendance_id: attendance.id, end_time: null },
            order: [['start_time', 'DESC']]
        });

        if (!attnBreak) {
            return res.status(400).json({ error: 'No active break session found.' });
        }

        const endTime = new Date();
        const durationDecimal = (endTime - new Date(attnBreak.start_time)) / (1000 * 60);
        const durationMinutes = Math.round(durationDecimal);

        await attnBreak.update({
            end_time: endTime,
            duration_minutes: durationMinutes
        });

        // Update total break minutes in parent attendance record
        const totalBreaks = await AttendanceBreak.sum('duration_minutes', {
            where: { attendance_id: attendance.id }
        });

        await attendance.update({
            total_break_minutes: totalBreaks
        });

        await logActivity(userId, 'END_BREAK', 'AttendanceBreak', attnBreak.id, null, attnBreak.toJSON(), req);

        res.status(200).json({ message: 'Break ended', break: attnBreak, total_break_minutes: totalBreaks });
    } catch (error) {
        console.error('End Break Error:', error);
        res.status(500).json({ error: 'Failed to end break' });
    }
};
