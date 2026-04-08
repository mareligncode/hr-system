import {
    Employee,
    ShiftAssignment,
    ShiftType,
    LeaveRequest,
    User,
    Department
} from '../models/index.js';
import { Op } from 'sequelize';
import { checkShiftConflict } from './shiftService.js';

/**
 * Intelligent Shift Optimization Service
 * 
 * Provides algorithms for:
 * - Recommending the best employee for a shift
 * - Auto-filling empty shifts based on availability and cost
 * - Detecting fatigue (back-to-back shifts)
 */

export const getEmployeeRecommendations = async (date, shiftTypeId, departmentId) => {
    try {
        const shiftType = await ShiftType.findByPk(shiftTypeId);
        if (!shiftType) throw new Error('Shift type not found');

        // 1. Fetch all active employees in department
        const employees = await Employee.findAll({
            where: {
                department_id: departmentId,
                employment_status: 'active'
            },
            include: [{ model: User, attributes: ['id', 'first_name', 'last_name', 'email'] }]
        });

        const recommendations = [];

        for (const emp of employees) {
            let score = 100;
            let reasons = [];
            let isAvailable = true;

            // 2. CHECK: Shift Conflict (Overlap)
            const conflict = await checkShiftConflict(emp.user_id, date, shiftTypeId);
            if (conflict.hasConflict) {
                isAvailable = false;
                reasons.push('Current Schedule Conflict');
            }

            // 3. CHECK: Leave Status
            const leave = await LeaveRequest.findOne({
                where: {
                    employee_id: emp.user_id,
                    status: 'approved',
                    start_date: { [Op.lte]: date },
                    end_date: { [Op.gte]: date }
                }
            });
            if (leave) {
                isAvailable = false;
                reasons.push('On Approved Leave');
            }

            if (!isAvailable) continue;

            // 4. CALC: Current Workload (Hours worked this week)
            const startOfWeek = new Date(date);
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(endOfWeek.getDate() + 6);

            const weeklyAssignments = await ShiftAssignment.findAll({
                where: {
                    employee_id: emp.user_id,
                    assignment_date: { [Op.between]: [startOfWeek.toISOString().split('T')[0], endOfWeek.toISOString().split('T')[0]] }
                },
                include: [ShiftType]
            });

            let weeklyHours = 0;
            for (const a of weeklyAssignments) {
                const st = a.ShiftType;
                const duration = getShiftDuration(st.start_time, st.end_time, st.is_overnight);
                weeklyHours += duration;
            }

            // Penalty for high workload
            if (weeklyHours > 40) {
                score -= 30;
                reasons.push('High Weekly Workload (>40h)');
            } else if (weeklyHours > 30) {
                score -= 10;
                reasons.push('Moderate Workload (>30h)');
            } else {
                score += 10;
                reasons.push('Low Workload Availability');
            }

            // 5. CHECK: Fatigue (Worked yesterday?)
            const yesterday = new Date(date);
            yesterday.setDate(yesterday.getDate() - 1);
            const workedYesterday = await ShiftAssignment.findOne({
                where: {
                    employee_id: emp.user_id,
                    assignment_date: yesterday.toISOString().split('T')[0]
                }
            });
            if (workedYesterday) {
                score -= 15;
                reasons.push('Worked Yesterday');
            }

            recommendations.push({
                employee_id: emp.user_id,
                name: `${emp.User.first_name} ${emp.User.last_name}`,
                score,
                reasons,
                weeklyHours: weeklyHours.toFixed(1)
            });
        }

        // Sort by score descending
        return recommendations.sort((a, b) => b.score - a.score);
    } catch (error) {
        console.error('Optimization Error:', error);
        throw error;
    }
};

/**
 * Helper to calculate shift duration in hours
 */
const getShiftDuration = (start, end, overnight) => {
    const toMin = (s) => parseInt(s.split(':')[0]) * 60 + parseInt(s.split(':')[1]);
    let s = toMin(start);
    let e = toMin(end);
    if (overnight && e <= s) e += 1440;
    return (e - s) / 60;
};

export default {
    getEmployeeRecommendations
};
