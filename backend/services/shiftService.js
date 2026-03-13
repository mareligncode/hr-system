/**
 * Shift Management Service
 * 
 * Business logic layer for shift operations including:
 * - Conflict detection for overlapping shift assignments
 * - Input validation for shift assignments
 * - Rotational shift generation
 * - Shift coverage, overtime, and department summary reports
 */

import { ShiftAssignment, ShiftType, ShiftTemplate, Employee, User, Department } from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

// ============================================================
// CONFLICT DETECTION
// ============================================================

/**
 * Check if a new shift assignment conflicts with existing assignments
 * for the same employee on the same date.
 * 
 * For overnight shifts, also checks the previous and next day.
 * 
 * @param {number} employee_id - The employee's user_id
 * @param {string} date - Assignment date (YYYY-MM-DD)
 * @param {number} shift_type_id - The shift type being assigned
 * @param {number|null} excludeId - Assignment ID to exclude (for updates)
 * @returns {Object} { hasConflict: boolean, conflicts: Array }
 */
export const checkShiftConflict = async (employee_id, date, shift_type_id, excludeId = null) => {
    // Get the shift type being assigned to know its times
    const newShiftType = await ShiftType.findByPk(shift_type_id);
    if (!newShiftType) {
        throw new Error('Shift type not found');
    }

    // Build the date range to check — include adjacent days for overnight shifts
    const checkDate = new Date(date);
    const prevDate = new Date(checkDate);
    prevDate.setDate(prevDate.getDate() - 1);
    const nextDate = new Date(checkDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const dateRange = [
        prevDate.toISOString().split('T')[0],
        date,
        nextDate.toISOString().split('T')[0]
    ];

    const where = {
        employee_id,
        assignment_date: { [Op.in]: dateRange }
    };

    // Exclude current assignment when updating
    if (excludeId) {
        where.id = { [Op.ne]: excludeId };
    }

    const existingAssignments = await ShiftAssignment.findAll({
        where,
        include: [{ model: ShiftType }]
    });

    const conflicts = [];

    for (const existing of existingAssignments) {
        const existingShift = existing.ShiftType;
        const isSameDay = existing.assignment_date === date;

        if (isSameDay) {
            // Same day — check time overlap
            const overlap = checkTimeOverlap(
                newShiftType.start_time, newShiftType.end_time, newShiftType.is_overnight,
                existingShift.start_time, existingShift.end_time, existingShift.is_overnight
            );
            if (overlap) {
                conflicts.push({
                    assignment_id: existing.id,
                    date: existing.assignment_date,
                    shift_name: existingShift.name,
                    shift_time: `${existingShift.start_time.substring(0, 5)} - ${existingShift.end_time.substring(0, 5)}`,
                    type: 'same_day_overlap'
                });
            }
        } else if (existing.assignment_date === prevDate.toISOString().split('T')[0] && existingShift.is_overnight) {
            // Previous day's overnight shift might bleed into this day
            const overlap = checkOvernightBleed(
                existingShift.end_time,
                newShiftType.start_time
            );
            if (overlap) {
                conflicts.push({
                    assignment_id: existing.id,
                    date: existing.assignment_date,
                    shift_name: existingShift.name,
                    shift_time: `${existingShift.start_time.substring(0, 5)} - ${existingShift.end_time.substring(0, 5)} (overnight)`,
                    type: 'overnight_bleed_from_previous'
                });
            }
        } else if (existing.assignment_date === nextDate.toISOString().split('T')[0] && newShiftType.is_overnight) {
            // New shift is overnight and might bleed into next day's shift
            const overlap = checkOvernightBleed(
                newShiftType.end_time,
                existingShift.start_time
            );
            if (overlap) {
                conflicts.push({
                    assignment_id: existing.id,
                    date: existing.assignment_date,
                    shift_name: existingShift.name,
                    shift_time: `${existingShift.start_time.substring(0, 5)} - ${existingShift.end_time.substring(0, 5)}`,
                    type: 'overnight_bleed_to_next'
                });
            }
        }
    }

    return {
        hasConflict: conflicts.length > 0,
        conflicts
    };
};

/**
 * Check if two time ranges overlap on the same day.
 * Handles overnight shifts that cross midnight.
 */
const checkTimeOverlap = (startA, endA, overnightA, startB, endB, overnightB) => {
    const toMinutes = (timeStr) => {
        const parts = timeStr.split(':');
        return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    };

    let aStart = toMinutes(startA);
    let aEnd = toMinutes(endA);
    let bStart = toMinutes(startB);
    let bEnd = toMinutes(endB);

    // For overnight shifts, extend end time past midnight
    if (overnightA && aEnd <= aStart) aEnd += 1440;
    if (overnightB && bEnd <= bStart) bEnd += 1440;

    // Check overlap
    return aStart < bEnd && bStart < aEnd;
};

/**
 * Check if an overnight shift's end time (on the next day) overlaps
 * with another shift's start time on that next day.
 */
const checkOvernightBleed = (overnightEndTime, nextDayStartTime) => {
    const toMinutes = (timeStr) => {
        const parts = timeStr.split(':');
        return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    };
    // The overnight shift ends at overnightEndTime the next morning
    // If the next day's shift starts before the overnight shift ends, there's a conflict
    return toMinutes(nextDayStartTime) < toMinutes(overnightEndTime);
};

// ============================================================
// VALIDATION
// ============================================================

/**
 * Validate a shift assignment's input data.
 * Returns an object with { valid: boolean, errors: string[] }
 */
export const validateShiftAssignment = async (data) => {
    const errors = [];

    if (!data.employee_id) errors.push('Employee is required');
    if (!data.shift_type_id) errors.push('Shift type is required');
    if (!data.assignment_date) errors.push('Assignment date is required');

    // Date validation
    if (data.assignment_date) {
        const assignDate = new Date(data.assignment_date + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // We actually allow past dates for historical record keeping, 
        // but we'll keep the check if we want to enforce it for regular users in the future.
        // For now, let's just ensure the date is valid.
        if (isNaN(assignDate.getTime())) {
            errors.push('Invalid assignment date');
        }
    }

    // Validate employee exists
    if (data.employee_id) {
        const employee = await Employee.findOne({ where: { user_id: data.employee_id } });
        if (!employee) errors.push('Employee not found');
        if (employee && employee.employment_status !== 'active') {
            errors.push('Cannot assign shifts to inactive employees');
        }
    }

    // Validate shift type exists and is active
    if (data.shift_type_id) {
        const shiftType = await ShiftType.findByPk(data.shift_type_id);
        if (!shiftType) errors.push('Shift type not found');
        if (shiftType && !shiftType.is_active) errors.push('Shift type is not active');
    }

    return { valid: errors.length === 0, errors };
};

// ============================================================
// ROTATION LOGIC
// ============================================================

/**
 * Generate shift assignments from a rotation pattern.
 * 
 * A rotation pattern is an array of objects with { shift_type_id }.
 * The employees rotate through shift types in a cycle.
 * 
 * @param {Object} rotation - The ShiftRotation record
 * @param {Array} employeeIds - Employee IDs to rotate
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @param {number} createdBy - User ID who's creating the assignments
 * @returns {Array} Array of assignment objects ready for bulkCreate
 */
export const generateRotationAssignments = (rotation, employeeIds, startDate, endDate, createdBy) => {
    const pattern = rotation.rotation_pattern; // Array of shift_type_ids
    const cycleDays = rotation.cycle_days || pattern.length;
    const assignments = [];

    let currentDate = new Date(startDate);
    const lastDate = new Date(endDate);
    let dayIndex = 0;

    while (currentDate <= lastDate) {
        const dayOfWeek = currentDate.getDay(); // 0=Sunday

        // Skip weekends if rotation doesn't include them (optional flag)
        // For now, generate for all days

        for (let empIdx = 0; empIdx < employeeIds.length; empIdx++) {
            // Each employee gets a shift type based on their offset in the rotation
            const patternIndex = (dayIndex + empIdx) % pattern.length;
            const shiftTypeId = pattern[patternIndex];

            if (shiftTypeId) { // null/0 means day off in the pattern
                assignments.push({
                    employee_id: employeeIds[empIdx],
                    shift_type_id: shiftTypeId,
                    assignment_date: currentDate.toISOString().split('T')[0],
                    status: 'scheduled',
                    created_by: createdBy
                });
            }
        }

        currentDate.setDate(currentDate.getDate() + 1);
        dayIndex++;

        // Reset cycle
        if (dayIndex >= cycleDays) dayIndex = 0;
    }

    return assignments;
};

// ============================================================
// REPORTS
// ============================================================

/**
 * Get shift coverage report for a department within a date range.
 * Shows how many shifts are assigned vs how many employees are available.
 */
export const getShiftCoverageReport = async (departmentId, from, to) => {
    const where = {
        assignment_date: { [Op.between]: [from, to] }
    };

    const include = [
        { model: ShiftType, where: departmentId ? { department_id: departmentId } : undefined, required: !!departmentId },
        { model: Employee, include: [{ model: User, attributes: ['first_name', 'last_name'] }] }
    ];

    const assignments = await ShiftAssignment.findAll({ where, include, order: [['assignment_date', 'ASC']] });

    // Get total employees in department
    const employeeWhere = departmentId ? { department_id: departmentId, employment_status: 'active' } : { employment_status: 'active' };
    const totalEmployees = await Employee.count({ where: employeeWhere });

    // Group by date
    const coverageByDate = {};
    for (const a of assignments) {
        const date = a.assignment_date;
        if (!coverageByDate[date]) {
            coverageByDate[date] = { date, assigned: 0, employees: new Set() };
        }
        coverageByDate[date].assigned++;
        coverageByDate[date].employees.add(a.employee_id);
    }

    const coverage = Object.values(coverageByDate).map(day => ({
        date: day.date,
        shifts_assigned: day.assigned,
        unique_employees: day.employees.size,
        total_employees: totalEmployees,
        coverage_percentage: totalEmployees > 0 ? Math.round((day.employees.size / totalEmployees) * 100) : 0
    }));

    return {
        total_employees: totalEmployees,
        total_shifts: assignments.length,
        date_range: { from, to },
        daily_coverage: coverage
    };
};

/**
 * Get overtime report — employees who have more shift hours
 * than their overtime threshold within the date range.
 */
export const getOvertimeReport = async (departmentId, from, to) => {
    const where = {
        assignment_date: { [Op.between]: [from, to] }
    };

    const include = [
        {
            model: ShiftType,
            where: departmentId ? { department_id: departmentId } : undefined,
            required: !!departmentId
        },
        {
            model: Employee,
            include: [
                { model: User, attributes: ['first_name', 'last_name'] },
                { model: Department, attributes: ['name'] }
            ]
        }
    ];

    const assignments = await ShiftAssignment.findAll({ where, include });

    // Calculate hours per employee
    const employeeHours = {};
    for (const a of assignments) {
        const empId = a.employee_id;
        if (!employeeHours[empId]) {
            employeeHours[empId] = {
                employee_id: empId,
                employee_name: `${a.Employee?.User?.first_name || ''} ${a.Employee?.User?.last_name || ''}`.trim(),
                department: a.Employee?.Department?.name || 'N/A',
                total_shifts: 0,
                total_hours: 0,
                overtime_hours: 0,
                overtime_threshold: parseFloat(a.ShiftType.overtime_threshold_hours) || 8
            };
        }

        // Calculate shift duration
        const shiftType = a.ShiftType;
        const startParts = shiftType.start_time.split(':');
        const endParts = shiftType.end_time.split(':');
        let startMin = parseInt(startParts[0] || 0) * 60 + parseInt(startParts[1] || 0);
        let endMin = parseInt(endParts[0] || 0) * 60 + parseInt(endParts[1] || 0);
        if (shiftType.is_overnight && endMin <= startMin) endMin += 1440;
        const shiftMinutes = Math.max(0, endMin - startMin - (shiftType.break_duration_minutes || 0));
        const shiftHours = shiftMinutes / 60;

        employeeHours[empId].total_shifts++;
        employeeHours[empId].total_hours += shiftHours;
    }

    // Calculate weekly overtime (threshold is per shift, but report weekly)
    const result = Object.values(employeeHours).map(emp => {
        const standardHoursPerShift = emp.overtime_threshold;
        const standardTotal = standardHoursPerShift * emp.total_shifts;
        emp.overtime_hours = Math.max(0, parseFloat((emp.total_hours - standardTotal).toFixed(2)));
        emp.total_hours = parseFloat(emp.total_hours.toFixed(2));
        return emp;
    });

    return result.sort((a, b) => b.overtime_hours - a.overtime_hours);
};

/**
 * Get department shift summary — aggregate counts per shift type.
 */
export const getDepartmentShiftSummary = async (departmentId, from, to) => {
    const where = {
        assignment_date: { [Op.between]: [from, to] }
    };

    const include = [
        {
            model: ShiftType,
            where: departmentId ? { department_id: departmentId } : undefined,
            required: !!departmentId,
            attributes: ['id', 'name', 'code', 'color_code', 'start_time', 'end_time', 'is_overnight']
        }
    ];

    const assignments = await ShiftAssignment.findAll({ where, include });

    // Group by shift type
    const summary = {};
    for (const a of assignments) {
        const st = a.ShiftType;
        if (!summary[st.id]) {
            summary[st.id] = {
                shift_type_id: st.id,
                shift_name: st.name,
                shift_code: st.code,
                color_code: st.color_code,
                time_range: `${st.start_time.substring(0, 5)} - ${st.end_time.substring(0, 5)}`,
                is_overnight: st.is_overnight,
                total_assignments: 0,
                unique_employees: new Set()
            };
        }
        summary[st.id].total_assignments++;
        summary[st.id].unique_employees.add(a.employee_id);
    }

    return Object.values(summary).map(s => ({
        ...s,
        unique_employees: s.unique_employees.size
    }));
};

export default {
    checkShiftConflict,
    validateShiftAssignment,
    generateRotationAssignments,
    getShiftCoverageReport,
    getOvertimeReport,
    getDepartmentShiftSummary
};
