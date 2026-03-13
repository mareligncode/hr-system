

import { ShiftType, ShiftAssignment, ShiftSwapRequest, ShiftTemplate, ShiftRotation, Employee, User, Department } from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import { logActivity } from '../services/auditService.js';
import {
    checkShiftConflict,
    validateShiftAssignment,
    generateRotationAssignments,
    getShiftCoverageReport,
    getOvertimeReport,
    getDepartmentShiftSummary
} from '../services/shiftService.js';

// ============================================================
// HELPER: Get manager's department_id
// ============================================================

const getManagerDepartmentId = async (userId) => {
    const manager = await Employee.findOne({ where: { user_id: userId } });
    if (!manager) return null;
    return manager.department_id;
};


export const getShiftTypes = async (req, res) => {
    try {
        let { department_id } = req.query;

        if (req.user.role === 'manager') {
            const mgrDeptId = await getManagerDepartmentId(req.user.id);
            if (!mgrDeptId) return res.status(404).json({ error: 'Manager profile not found' });
            department_id = mgrDeptId;
        }

        const where = { is_active: true };
        if (department_id) where.department_id = department_id;

        const shiftTypes = await ShiftType.findAll({
            where,
            include: [{ model: Department, attributes: ['name'] }],
            order: [['name', 'ASC']]
        });
        res.status(200).json(shiftTypes);
    } catch (error) {
        console.error('getShiftTypes error:', error);
        res.status(500).json({ error: 'Failed to fetch shift types', details: error.message });
    }
};


export const createShiftType = async (req, res) => {
    try {
        const { name, code, department_id, start_time, end_time,
            break_duration_minutes, is_overnight, overtime_threshold_hours,
            grace_period_minutes, color_code } = req.body;

        // Validation
        if (!name || !code || !department_id || !start_time || !end_time) {
            return res.status(400).json({ error: 'Name, code, department, start time, and end time are required' });
        }

        // Check for duplicate code
        const existing = await ShiftType.findOne({ where: { code } });
        if (existing) {
            return res.status(400).json({ error: `Shift type code '${code}' already exists` });
        }

        // Manager scoping: ensure manager can only create for their department
        if (req.user.role === 'manager') {
            const mgrDeptId = await getManagerDepartmentId(req.user.id);
            if (!mgrDeptId || parseInt(department_id) !== mgrDeptId) {
                return res.status(403).json({ error: 'You can only create shift types for your department' });
            }
        }

        const shiftType = await ShiftType.create({
            name,
            code,
            department_id,
            start_time,
            end_time,
            break_duration_minutes: break_duration_minutes || 60,
            is_overnight: is_overnight || false,
            overtime_threshold_hours: overtime_threshold_hours || 8.0,
            grace_period_minutes: grace_period_minutes || 15,
            color_code: color_code || '#3788d8',
            created_by: req.user.id
        });

        await logActivity(req.user.id, 'CREATE_SHIFT_TYPE', 'ShiftType', shiftType.id, null, shiftType.toJSON(), req);
        res.status(201).json(shiftType);
    } catch (error) {
        console.error('createShiftType error:', error);
        res.status(500).json({ error: 'Failed to create shift type', details: error.message });
    }
};


export const updateShiftType = async (req, res) => {
    try {
        const { id } = req.params;
        const shiftType = await ShiftType.findByPk(id);
        if (!shiftType) return res.status(404).json({ error: 'Shift type not found' });

        if (req.user.role === 'manager') {
            const mgrDeptId = await getManagerDepartmentId(req.user.id);
            if (!mgrDeptId || shiftType.department_id !== mgrDeptId) {
                return res.status(403).json({ error: 'You can only update shift types in your department' });
            }
        }

        if (req.body.code && req.body.code !== shiftType.code) {
            const existingCode = await ShiftType.findOne({ where: { code: req.body.code, id: { [Op.ne]: id } } });
            if (existingCode) {
                return res.status(400).json({ error: `Shift type code '${req.body.code}' already exists` });
            }
        }

        const oldValues = shiftType.toJSON();
        await shiftType.update(req.body);
        await logActivity(req.user.id, 'UPDATE_SHIFT_TYPE', 'ShiftType', id, oldValues, req.body, req);
        res.status(200).json(shiftType);
    } catch (error) {
        console.error('updateShiftType error:', error);
        res.status(500).json({ error: 'Failed to update shift type', details: error.message });
    }
};


export const deleteShiftType = async (req, res) => {
    try {
        const { id } = req.params;
        const shiftType = await ShiftType.findByPk(id);
        if (!shiftType) return res.status(404).json({ error: 'Shift type not found' });

        const futureAssignments = await ShiftAssignment.count({
            where: {
                shift_type_id: id,
                assignment_date: { [Op.gte]: new Date().toISOString().split('T')[0] }
            }
        });

        if (futureAssignments > 0) {
            return res.status(400).json({
                error: `Cannot deactivate: ${futureAssignments} future shift assignment(s) use this type. Reassign them first.`
            });
        }

        await shiftType.update({ is_active: false });
        await logActivity(req.user.id, 'DELETE_SHIFT_TYPE', 'ShiftType', id, null, { is_active: false }, req);
        res.status(200).json({ message: 'Shift type deactivated successfully' });
    } catch (error) {
        console.error('deleteShiftType error:', error);
        res.status(500).json({ error: 'Failed to deactivate shift type', details: error.message });
    }
};


export const getShiftAssignments = async (req, res) => {
    try {
        let { employee_id, from, to, department_id, status } = req.query;

        // Manager and Employee scoping
        if (req.user.role === 'manager' || req.user.role === 'employee') {
            const mgrDeptId = await getManagerDepartmentId(req.user.id);
            if (!mgrDeptId) return res.status(404).json({ error: 'Employee profile not found' });

            if (req.user.role === 'manager') {
                if (employee_id && parseInt(employee_id) !== req.user.id) {
                    department_id = mgrDeptId;
                } else if (!employee_id) {
                    department_id = mgrDeptId;
                }
            } else {
                // Regular employees only see their own department
                department_id = mgrDeptId;
            }
        }

        const where = {};
        if (employee_id) where.employee_id = employee_id;
        if (status) where.status = status;

        if (from && to) {
            where.assignment_date = { [Op.between]: [from, to] };
        } else if (from) {
            where.assignment_date = { [Op.gte]: from };
        } else if (to) {
            where.assignment_date = { [Op.lte]: to };
        }

        const include = [
            { model: ShiftType },
            {
                model: Employee,
                include: [{ model: User, attributes: ['first_name', 'last_name', 'employee_id'] }],
                where: department_id ? { department_id } : undefined,
                required: !!department_id || !!employee_id
            }
        ];

        const assignments = await ShiftAssignment.findAll({
            where,
            include,
            order: [['assignment_date', 'ASC']]
        });
        res.status(200).json(assignments);
    } catch (error) {
        console.error('getShiftAssignments error:', error);
        res.status(500).json({ error: 'Failed to fetch shift assignments', details: error.message });
    }
};


export const createShiftAssignment = async (req, res) => {
    try {
        const { employee_id, shift_type_id, assignment_date, notes } = req.body;

        const validation = await validateShiftAssignment({ employee_id, shift_type_id, assignment_date });
        if (!validation.valid) {
            return res.status(400).json({ error: 'Validation failed', details: validation.errors });
        }

        // Manager scoping
        if (req.user.role === 'manager') {
            const mgrDeptId = await getManagerDepartmentId(req.user.id);
            const targetEmployee = await Employee.findOne({ where: { user_id: employee_id } });
            if (!mgrDeptId || !targetEmployee || mgrDeptId !== targetEmployee.department_id) {
                return res.status(403).json({ error: 'You can only assign shifts to employees in your department' });
            }
        }

        const conflict = await checkShiftConflict(employee_id, assignment_date, shift_type_id);
        if (conflict.hasConflict) {
            return res.status(409).json({
                error: 'Shift conflict detected',
                conflicts: conflict.conflicts,
                message: `Employee already has overlapping shift(s) on ${assignment_date}`
            });
        }

        const assignment = await ShiftAssignment.create({
            employee_id,
            shift_type_id,
            assignment_date,
            notes,
            status: 'scheduled',
            created_by: req.user.id
        });

        // Fetch with associations for response
        const fullAssignment = await ShiftAssignment.findByPk(assignment.id, {
            include: [
                { model: ShiftType },
                { model: Employee, include: [{ model: User, attributes: ['first_name', 'last_name'] }] }
            ]
        });

        await logActivity(req.user.id, 'CREATE_SHIFT_ASSIGNMENT', 'ShiftAssignment', assignment.id, null, assignment.toJSON(), req);
        res.status(201).json(fullAssignment);
    } catch (error) {
        console.error('createShiftAssignment error:', error);
        res.status(500).json({ error: 'Failed to create shift assignment', details: error.message });
    }
};

/**
 * POST /shifts/assignments/bulk
 * Bulk create shift assignments with per-assignment conflict detection.
 */
export const bulkCreateAssignments = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { assignments } = req.body;
        if (!Array.isArray(assignments) || assignments.length === 0) {
            return res.status(400).json({ error: 'Assignments must be a non-empty array' });
        }

        // Manager scoping
        if (req.user.role === 'manager') {
            const mgrDeptId = await getManagerDepartmentId(req.user.id);
            if (!mgrDeptId) {
                await transaction.rollback();
                return res.status(404).json({ error: 'Manager profile not found' });
            }

            const employeeIds = [...new Set(assignments.map(a => a.employee_id))];
            const targetEmployees = await Employee.findAll({
                where: { user_id: { [Op.in]: employeeIds } }
            });

            const unauthorized = targetEmployees.some(emp => emp.department_id !== mgrDeptId);
            if (unauthorized || targetEmployees.length !== employeeIds.length) {
                await transaction.rollback();
                return res.status(403).json({ error: 'You can only assign shifts to employees in your department' });
            }
        }

        const conflictResults = [];
        for (const a of assignments) {
            const conflict = await checkShiftConflict(a.employee_id, a.assignment_date, a.shift_type_id);
            if (conflict.hasConflict) {
                conflictResults.push({
                    employee_id: a.employee_id,
                    date: a.assignment_date,
                    conflicts: conflict.conflicts
                });
            }
        }

        if (conflictResults.length > 0) {
            await transaction.rollback();
            return res.status(409).json({
                error: 'Shift conflicts detected',
                conflicts: conflictResults,
                message: `${conflictResults.length} assignment(s) have conflicts`
            });
        }

        const created = await ShiftAssignment.bulkCreate(
            assignments.map(a => ({ ...a, status: 'scheduled', created_by: req.user.id })),
            { transaction }
        );

        await transaction.commit();
        await logActivity(req.user.id, 'BULK_CREATE_SHIFT_ASSIGNMENTS', 'ShiftAssignment', null, null, { count: created.length }, req);
        res.status(201).json({ message: `${created.length} shifts assigned successfully`, count: created.length });
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('bulkCreateAssignments error:', error);
        res.status(500).json({ error: 'Failed to bulk create shift assignments', details: error.message });
    }
};


export const checkConflict = async (req, res) => {
    try {
        const { employee_id, assignment_date, shift_type_id, exclude_id } = req.body;

        if (!employee_id || !assignment_date || !shift_type_id) {
            return res.status(400).json({ error: 'employee_id, assignment_date, and shift_type_id are required' });
        }

        const result = await checkShiftConflict(employee_id, assignment_date, shift_type_id, exclude_id);
        res.status(200).json(result);
    } catch (error) {
        console.error('checkConflict error:', error);
        res.status(500).json({ error: 'Failed to check conflict', details: error.message });
    }
};


export const updateShiftAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        const assignment = await ShiftAssignment.findByPk(id, {
            include: [{ model: Employee, attributes: ['department_id'] }]
        });
        if (!assignment) return res.status(404).json({ error: 'Shift assignment not found' });

        // Manager scoping
        if (req.user.role === 'manager') {
            const mgrDeptId = await getManagerDepartmentId(req.user.id);
            if (!mgrDeptId || mgrDeptId !== assignment.Employee.department_id) {
                return res.status(403).json({ error: 'You can only update assignments in your department' });
            }
        }

        // If changing shift type or date, check for conflicts
        if (req.body.shift_type_id || req.body.assignment_date) {
            const conflictCheck = await checkShiftConflict(
                assignment.employee_id,
                req.body.assignment_date || assignment.assignment_date,
                req.body.shift_type_id || assignment.shift_type_id,
                parseInt(id)
            );
            if (conflictCheck.hasConflict) {
                return res.status(409).json({
                    error: 'Shift conflict detected',
                    conflicts: conflictCheck.conflicts
                });
            }
        }

        const oldValues = assignment.toJSON();
        await assignment.update(req.body);
        await logActivity(req.user.id, 'UPDATE_SHIFT_ASSIGNMENT', 'ShiftAssignment', id, oldValues, req.body, req);
        res.status(200).json(assignment);
    } catch (error) {
        console.error('updateShiftAssignment error:', error);
        res.status(500).json({ error: 'Failed to update shift assignment', details: error.message });
    }
};

/**
 * DELETE /shifts/assignments/:id
 * Delete a shift assignment.
 */
export const deleteShiftAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        const assignment = await ShiftAssignment.findByPk(id, {
            include: [{ model: Employee, attributes: ['department_id'] }]
        });
        if (!assignment) return res.status(404).json({ error: 'Shift assignment not found' });

        // Manager scoping
        if (req.user.role === 'manager') {
            const mgrDeptId = await getManagerDepartmentId(req.user.id);
            if (!mgrDeptId || mgrDeptId !== assignment.Employee.department_id) {
                return res.status(403).json({ error: 'You can only delete assignments in your department' });
            }
        }

        // Manually clean up any linked swap requests to avoid foreign key constraints
        await ShiftSwapRequest.destroy({ where: { shift_assignment_id: id } });

        await assignment.destroy();
        await logActivity(req.user.id, 'DELETE_SHIFT_ASSIGNMENT', 'ShiftAssignment', id, null, null, req);
        res.status(200).json({ message: 'Shift assignment deleted successfully' });
    } catch (error) {
        console.error('deleteShiftAssignment error:', error);
        res.status(500).json({ error: 'Failed to delete shift assignment', details: error.message });
    }
};

/**
 * GET /shifts/assignments/my
 * Get the currently authenticated employee's assigned shifts.
 */
export const getMyShifts = async (req, res) => {
    try {
        const { from, to } = req.query;
        // Search by employee_id matching the authenticated user's ID
        const where = {
            employee_id: req.user.id,
            status: { [Op.ne]: 'missed' } // Hide missed shifts, but show scheduled and completed
        };

        if (from && to) {
            where.assignment_date = { [Op.between]: [from, to] };
        } else if (from) {
            where.assignment_date = { [Op.gte]: from };
        } else if (to) {
            where.assignment_date = { [Op.lte]: to };
        }

        const assignments = await ShiftAssignment.findAll({
            where,
            include: [
                { model: ShiftType },
                {
                    model: Employee,
                    include: [{ model: User, attributes: ['first_name', 'last_name', 'employee_id'] }]
                }
            ],
            order: [['assignment_date', 'ASC']]
        });
        res.status(200).json(assignments);
    } catch (error) {
        console.error('getMyShifts error:', error);
        res.status(500).json({ error: 'Failed to fetch your shifts', details: error.message });
    }
};

// ============================================================
// SHIFT SWAP CONTROLLERS
// ============================================================

/**
 * GET /shifts/swaps
 * List shift swap requests. Admins/HR see all, managers see their department.
 */
export const getShiftSwaps = async (req, res) => {
    try {
        let { status, department_id } = req.query;

        // Manager scoping
        if (req.user.role === 'manager') {
            const mgrDeptId = await getManagerDepartmentId(req.user.id);
            if (!mgrDeptId) return res.status(404).json({ error: 'Manager profile not found' });
            department_id = mgrDeptId;
        }

        const where = {};
        if (status) where.status = status;

        const include = [
            {
                model: Employee, as: 'Requester',
                include: [{ model: User, attributes: ['first_name', 'last_name'] }],
                where: department_id ? { department_id } : undefined,
                required: !!department_id
            },
            { model: Employee, as: 'TargetEmployee', include: [{ model: User, attributes: ['first_name', 'last_name'] }] },
            { model: ShiftAssignment, include: [{ model: ShiftType }] }
        ];

        const swaps = await ShiftSwapRequest.findAll({ where, include, order: [['created_at', 'DESC']] });
        res.status(200).json(swaps);
    } catch (error) {
        console.error('getShiftSwaps error:', error);
        res.status(500).json({ error: 'Failed to fetch shift swaps', details: error.message });
    }
};

/**
 * GET /shifts/swaps/my
 * Get the current employee's own swap requests (both as requester and as target).
 */
export const getMySwaps = async (req, res) => {
    try {
        const { status } = req.query;
        const where = {
            [Op.or]: [
                { requesting_employee_id: req.user.id },
                { target_employee_id: req.user.id }
            ]
        };
        if (status) where.status = status;

        const swaps = await ShiftSwapRequest.findAll({
            where,
            include: [
                { model: Employee, as: 'Requester', include: [{ model: User, attributes: ['first_name', 'last_name'] }] },
                { model: Employee, as: 'TargetEmployee', include: [{ model: User, attributes: ['first_name', 'last_name'] }] },
                { model: ShiftAssignment, include: [{ model: ShiftType }] }
            ],
            order: [['created_at', 'DESC']]
        });
        res.status(200).json(swaps);
    } catch (error) {
        console.error('getMySwaps error:', error);
        res.status(500).json({ error: 'Failed to fetch your swaps', details: error.message });
    }
};

/**
 * POST /shifts/swaps
 * Create a shift swap request.
 */
export const createShiftSwap = async (req, res) => {
    try {
        const { shift_assignment_id, target_employee_id, reason } = req.body;
        const requesting_employee_id = req.user.id;

        if (!shift_assignment_id || !target_employee_id) {
            return res.status(400).json({ error: 'shift_assignment_id and target_employee_id are required' });
        }

        // Validate the assignment belongs to the requester
        const assignment = await ShiftAssignment.findByPk(shift_assignment_id, {
            include: [{ model: ShiftType }]
        });
        if (!assignment) return res.status(404).json({ error: 'Shift assignment not found' });
        if (assignment.employee_id !== requesting_employee_id) {
            return res.status(403).json({ error: 'You can only swap your own shifts' });
        }

        // Cannot swap with yourself
        if (requesting_employee_id === parseInt(target_employee_id)) {
            return res.status(400).json({ error: 'Cannot swap a shift with yourself' });
        }

        // Check if target employee exists
        const targetEmployee = await Employee.findOne({ where: { user_id: target_employee_id } });
        if (!targetEmployee) return res.status(404).json({ error: 'Target employee not found' });

        // Check for duplicate pending swap
        const existingSwap = await ShiftSwapRequest.findOne({
            where: {
                shift_assignment_id,
                requesting_employee_id,
                status: 'pending'
            }
        });
        if (existingSwap) {
            return res.status(400).json({ error: 'A pending swap request already exists for this shift' });
        }

        // Check if target employee would have a conflict
        const conflict = await checkShiftConflict(
            target_employee_id,
            assignment.assignment_date,
            assignment.shift_type_id
        );
        if (conflict.hasConflict) {
            return res.status(409).json({
                error: 'Target employee has a conflicting shift on this date',
                conflicts: conflict.conflicts
            });
        }

        const swapRequest = await ShiftSwapRequest.create({
            requesting_employee_id,
            target_employee_id,
            shift_assignment_id,
            requested_date: assignment.assignment_date,
            reason,
            status: 'pending'
        });

        await logActivity(req.user.id, 'CREATE_SHIFT_SWAP', 'ShiftSwapRequest', swapRequest.id, null, swapRequest.toJSON(), req);
        res.status(201).json(swapRequest);
    } catch (error) {
        console.error('createShiftSwap error:', error);
        res.status(500).json({ error: 'Failed to create shift swap request', details: error.message });
    }
};

/**
 * PUT /shifts/swaps/:id/approve
 * Approve a shift swap request and update the assignment.
 */
export const approveShiftSwap = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const swapRequest = await ShiftSwapRequest.findByPk(id, {
            transaction,
            include: [
                { model: Employee, as: 'Requester', attributes: ['department_id'] },
                { model: ShiftAssignment, include: [{ model: ShiftType }] }
            ]
        });
        if (!swapRequest) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Swap request not found' });
        }

        // Manager scoping
        if (req.user.role === 'manager') {
            const mgrDeptId = await getManagerDepartmentId(req.user.id);
            if (!mgrDeptId || mgrDeptId !== swapRequest.Requester.department_id) {
                await transaction.rollback();
                return res.status(403).json({ error: 'You can only approve swaps in your department' });
            }
        }

        if (swapRequest.status !== 'pending') {
            await transaction.rollback();
            return res.status(400).json({ error: `Swap request cannot be approved because it is already ${swapRequest.status}` });
        }

        // Re-check conflict for the target employee before finalizing
        const conflict = await checkShiftConflict(
            swapRequest.target_employee_id,
            swapRequest.ShiftAssignment.assignment_date,
            swapRequest.ShiftAssignment.shift_type_id
        );
        if (conflict.hasConflict) {
            await transaction.rollback();
            return res.status(409).json({
                error: 'Cannot approve: target employee now has a conflicting shift',
                conflicts: conflict.conflicts
            });
        }

        const assignment = await ShiftAssignment.findByPk(swapRequest.shift_assignment_id, { transaction });
        if (!assignment) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Original assignment not found' });
        }

        // Transfer the assignment to the target employee
        await assignment.update({
            employee_id: swapRequest.target_employee_id,
            status: 'scheduled' // Keep as scheduled for the new owner
        }, { transaction });

        await swapRequest.update({
            status: 'approved',
            approved_by: req.user.id,
            approved_at: new Date()
        }, { transaction });

        await transaction.commit();
        await logActivity(req.user.id, 'APPROVE_SHIFT_SWAP', 'ShiftSwapRequest', id, null, { status: 'approved' }, req);
        res.status(200).json({ message: 'Shift swap approved and assignment updated' });
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('approveShiftSwap error:', error);
        res.status(500).json({ error: 'Failed to approve shift swap', details: error.message });
    }
};

/**
 * PUT /shifts/swaps/:id/reject
 * Reject a shift swap request.
 */
export const rejectShiftSwap = async (req, res) => {
    try {
        const { id } = req.params;
        const { rejection_reason } = req.body;
        const swapRequest = await ShiftSwapRequest.findByPk(id, {
            include: [{ model: Employee, as: 'Requester', attributes: ['department_id'] }]
        });
        if (!swapRequest) return res.status(404).json({ error: 'Swap request not found' });

        // Manager scoping
        if (req.user.role === 'manager') {
            const mgrDeptId = await getManagerDepartmentId(req.user.id);
            if (!mgrDeptId || mgrDeptId !== swapRequest.Requester.department_id) {
                return res.status(403).json({ error: 'You can only reject swaps in your department' });
            }
        }

        if (swapRequest.status !== 'pending') {
            return res.status(400).json({ error: `Swap request cannot be rejected because it is already ${swapRequest.status}` });
        }

        await swapRequest.update({
            status: 'rejected',
            rejection_reason,
            approved_by: req.user.id,
            approved_at: new Date()
        });

        await logActivity(req.user.id, 'REJECT_SHIFT_SWAP', 'ShiftSwapRequest', id, null, { status: 'rejected', rejection_reason }, req);
        res.status(200).json({ message: 'Shift swap rejected' });
    } catch (error) {
        console.error('rejectShiftSwap error:', error);
        res.status(500).json({ error: 'Failed to reject shift swap', details: error.message });
    }
};

// ============================================================
// SHIFT TEMPLATE CONTROLLERS
// ============================================================

/**
 * GET /shifts/templates
 * List shift templates. Managers scoped to their department.
 */
export const getShiftTemplates = async (req, res) => {
    try {
        let { department_id } = req.query;

        if (req.user.role === 'manager') {
            const mgrDeptId = await getManagerDepartmentId(req.user.id);
            if (!mgrDeptId) return res.status(404).json({ error: 'Manager profile not found' });
            department_id = mgrDeptId;
        }

        const where = { is_active: true };
        if (department_id) where.department_id = department_id;

        const templates = await ShiftTemplate.findAll({
            where,
            include: [{ model: Department, attributes: ['name'] }],
            order: [['name', 'ASC']]
        });
        res.status(200).json(templates);
    } catch (error) {
        console.error('getShiftTemplates error:', error);
        res.status(500).json({ error: 'Failed to fetch shift templates', details: error.message });
    }
};

/**
 * POST /shifts/templates
 * Create a new shift template.
 */
export const createShiftTemplate = async (req, res) => {
    try {
        let { name, department_id, pattern, start_date, end_date, is_recurring } = req.body;

        // Manager scoping
        if (req.user.role === 'manager') {
            const mgrDeptId = await getManagerDepartmentId(req.user.id);
            if (!mgrDeptId) return res.status(404).json({ error: 'Manager profile not found' });

            // Auto-fill or override with manager's department for safety
            department_id = mgrDeptId;
        }

        if (!name || !department_id || !pattern) {
            return res.status(400).json({ error: 'Name, department, and pattern are required' });
        }

        const template = await ShiftTemplate.create({
            name,
            department_id,
            pattern,
            start_date,
            end_date,
            is_recurring: is_recurring !== undefined ? is_recurring : true,
            created_by: req.user.id
        });

        await logActivity(req.user.id, 'CREATE_SHIFT_TEMPLATE', 'ShiftTemplate', template.id, null, template.toJSON(), req);
        res.status(201).json(template);
    } catch (error) {
        console.error('createShiftTemplate error:', error);
        res.status(500).json({ error: 'Failed to create shift template', details: error.message });
    }
};

/**
 * PUT /shifts/templates/:id
 * Update an existing shift template.
 */
export const updateShiftTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const template = await ShiftTemplate.findByPk(id);
        if (!template) return res.status(404).json({ error: 'Template not found' });

        // Manager scoping
        if (req.user.role === 'manager') {
            const mgrDeptId = await getManagerDepartmentId(req.user.id);
            if (!mgrDeptId || template.department_id !== mgrDeptId) {
                return res.status(403).json({ error: 'You can only update templates in your department' });
            }
        }

        const oldValues = template.toJSON();
        await template.update(req.body);
        await logActivity(req.user.id, 'UPDATE_SHIFT_TEMPLATE', 'ShiftTemplate', id, oldValues, req.body, req);
        res.status(200).json(template);
    } catch (error) {
        console.error('updateShiftTemplate error:', error);
        res.status(500).json({ error: 'Failed to update shift template', details: error.message });
    }
};

/**
 * DELETE /shifts/templates/:id
 * Soft-delete (deactivate) a shift template.
 */
export const deleteShiftTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const template = await ShiftTemplate.findByPk(id);
        if (!template) return res.status(404).json({ error: 'Template not found' });

        // Manager scoping
        if (req.user.role === 'manager') {
            const mgrDeptId = await getManagerDepartmentId(req.user.id);
            if (!mgrDeptId || template.department_id !== mgrDeptId) {
                return res.status(403).json({ error: 'You can only delete templates in your department' });
            }
        }

        await template.update({ is_active: false });
        await logActivity(req.user.id, 'DELETE_SHIFT_TEMPLATE', 'ShiftTemplate', id, null, { is_active: false }, req);
        res.status(200).json({ message: 'Template deactivated successfully' });
    } catch (error) {
        console.error('deleteShiftTemplate error:', error);
        res.status(500).json({ error: 'Failed to deactivate template', details: error.message });
    }
};

/**
 * POST /shifts/templates/:id/apply
 * Apply a shift template to a date range, creating assignments from the pattern.
 */
export const applyShiftTemplate = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { start_date, end_date, employee_id } = req.body;

        if (!start_date || !end_date) {
            await transaction.rollback();
            return res.status(400).json({ error: 'start_date and end_date are required' });
        }

        const template = await ShiftTemplate.findByPk(id);
        if (!template) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Template not found' });
        }

        // Manager scoping
        if (req.user.role === 'manager') {
            const mgrDeptId = await getManagerDepartmentId(req.user.id);
            if (!mgrDeptId || mgrDeptId !== template.department_id) {
                await transaction.rollback();
                return res.status(403).json({ error: 'You can only apply templates for your department' });
            }
        }

        const pattern = template.pattern;
        const assignments = [];
        const conflicts = [];

        // Fetch target employees
        let employees = [];
        if (employee_id) {
            const targetEmp = await Employee.findOne({
                where: { user_id: employee_id, department_id: template.department_id, employment_status: 'active' }
            });
            if (!targetEmp) {
                await transaction.rollback();
                return res.status(404).json({ error: 'Selected employee not found or is in a different department/inactive' });
            }
            employees = [targetEmp];
        } else {
            employees = await Employee.findAll({
                where: { department_id: template.department_id, employment_status: 'active' }
            });
        }

        if (employees.length === 0) {
            await transaction.rollback();
            return res.status(400).json({ error: 'No active employees found in this department to apply shifts to' });
        }

        let curr = new Date(start_date);
        const last = new Date(end_date);

        while (curr <= last) {
            const dayName = curr.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
            const dailyPatterns = pattern[dayName] || [];
            const dateStr = curr.toISOString().split('T')[0];

            for (const p of dailyPatterns) {
                // Apply this shift type to employees
                for (const emp of employees) {
                    const conflict = await checkShiftConflict(emp.user_id, dateStr, p.shift_type_id);
                    if (conflict.hasConflict) {
                        conflicts.push({ employee_id: emp.user_id, date: dateStr, conflicts: conflict.conflicts });
                    } else {
                        assignments.push({
                            employee_id: emp.user_id,
                            shift_type_id: p.shift_type_id,
                            assignment_date: dateStr,
                            status: 'scheduled',
                            created_by: req.user.id
                        });
                    }
                }
            }
            curr.setDate(curr.getDate() + 1);
        }

        const created = await ShiftAssignment.bulkCreate(assignments, { transaction });
        await transaction.commit();

        await logActivity(req.user.id, 'APPLY_SHIFT_TEMPLATE', 'ShiftTemplate', id, null, { count: created.length, skipped_conflicts: conflicts.length }, req);
        res.status(201).json({
            message: 'Template applied successfully',
            count: created.length,
            skipped_conflicts: conflicts.length,
            conflicts: conflicts.length > 0 ? conflicts : undefined
        });
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('applyShiftTemplate error:', error);
        res.status(500).json({ error: 'Failed to apply shift template', details: error.message });
    }
};

// ============================================================
// SHIFT ROTATION CONTROLLERS
// ============================================================

/**
 * GET /shifts/rotations
 * List shift rotations. Managers scoped to their department.
 */
export const getShiftRotations = async (req, res) => {
    try {
        let { department_id } = req.query;

        if (req.user.role === 'manager') {
            const mgrDeptId = await getManagerDepartmentId(req.user.id);
            if (!mgrDeptId) return res.status(404).json({ error: 'Manager profile not found' });
            department_id = mgrDeptId;
        }

        const where = { is_active: true };
        if (department_id) where.department_id = department_id;

        const rotations = await ShiftRotation.findAll({
            where,
            include: [{ model: Department, attributes: ['name'] }],
            order: [['name', 'ASC']]
        });
        res.status(200).json(rotations);
    } catch (error) {
        console.error('getShiftRotations error:', error);
        res.status(500).json({ error: 'Failed to fetch shift rotations', details: error.message });
    }
};

/**
 * POST /shifts/rotations
 * Create a new shift rotation pattern.
 */
export const createShiftRotation = async (req, res) => {
    try {
        const { name, description, department_id, rotation_pattern, cycle_days } = req.body;

        if (!name || !department_id || !rotation_pattern || !cycle_days) {
            return res.status(400).json({ error: 'Name, department, rotation pattern, and cycle days are required' });
        }

        if (!Array.isArray(rotation_pattern) || rotation_pattern.length === 0) {
            return res.status(400).json({ error: 'Rotation pattern must be a non-empty array of shift type IDs' });
        }

        // Manager scoping
        if (req.user.role === 'manager') {
            const mgrDeptId = await getManagerDepartmentId(req.user.id);
            if (!mgrDeptId || parseInt(department_id) !== mgrDeptId) {
                return res.status(403).json({ error: 'You can only create rotations for your department' });
            }
        }

        // Validate that all shift type IDs in the pattern exist
        const validIds = rotation_pattern.filter(id => id !== null);
        if (validIds.length > 0) {
            const existingTypes = await ShiftType.findAll({
                where: { id: { [Op.in]: validIds }, is_active: true }
            });
            if (existingTypes.length !== validIds.length) {
                return res.status(400).json({ error: 'One or more shift type IDs in the pattern are invalid or inactive' });
            }
        }

        const rotation = await ShiftRotation.create({
            name,
            description,
            department_id,
            rotation_pattern,
            cycle_days,
            created_by: req.user.id
        });

        await logActivity(req.user.id, 'CREATE_SHIFT_ROTATION', 'ShiftRotation', rotation.id, null, rotation.toJSON(), req);
        res.status(201).json(rotation);
    } catch (error) {
        console.error('createShiftRotation error:', error);
        res.status(500).json({ error: 'Failed to create shift rotation', details: error.message });
    }
};

/**
 * POST /shifts/rotations/:id/apply
 * Apply a rotation pattern to a set of employees for a date range.
 */
export const applyShiftRotation = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { employee_ids, start_date, end_date } = req.body;

        if (!employee_ids || !start_date || !end_date) {
            await transaction.rollback();
            return res.status(400).json({ error: 'employee_ids, start_date, and end_date are required' });
        }

        const rotation = await ShiftRotation.findByPk(id);
        if (!rotation) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Rotation not found' });
        }

        // Manager scoping
        if (req.user.role === 'manager') {
            const mgrDeptId = await getManagerDepartmentId(req.user.id);
            if (!mgrDeptId || rotation.department_id !== mgrDeptId) {
                await transaction.rollback();
                return res.status(403).json({ error: 'You can only apply rotations for your department' });
            }
        }

        // Generate assignments from rotation
        const assignments = generateRotationAssignments(rotation, employee_ids, start_date, end_date, req.user.id);

        // Filter out conflicting assignments
        const validAssignments = [];
        const skippedConflicts = [];

        for (const a of assignments) {
            const conflict = await checkShiftConflict(a.employee_id, a.assignment_date, a.shift_type_id);
            if (conflict.hasConflict) {
                skippedConflicts.push({ ...a, conflicts: conflict.conflicts });
            } else {
                validAssignments.push(a);
            }
        }

        const created = await ShiftAssignment.bulkCreate(validAssignments, { transaction });

        // Update rotation start_date if not set
        if (!rotation.start_date) {
            await rotation.update({ start_date }, { transaction });
        }

        await transaction.commit();
        await logActivity(req.user.id, 'APPLY_SHIFT_ROTATION', 'ShiftRotation', id, null, { count: created.length, skipped: skippedConflicts.length }, req);

        res.status(201).json({
            message: 'Rotation applied successfully',
            created: created.length,
            skipped_conflicts: skippedConflicts.length,
            conflicts: skippedConflicts.length > 0 ? skippedConflicts.slice(0, 10) : undefined
        });
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('applyShiftRotation error:', error);
        res.status(500).json({ error: 'Failed to apply shift rotation', details: error.message });
    }
};

// ============================================================
// SHIFT REPORT CONTROLLERS
// ============================================================

/**
 * GET /shifts/reports
 * Get shift reports: coverage, overtime, or department summary.
 * Query params: type (coverage|overtime|summary), department_id, from, to
 */
export const getShiftReports = async (req, res) => {
    try {
        const { type, department_id, from, to } = req.query;

        if (!from || !to) {
            return res.status(400).json({ error: 'from and to date parameters are required' });
        }

        // Manager scoping
        let deptId = department_id;
        if (req.user.role === 'manager') {
            const mgrDeptId = await getManagerDepartmentId(req.user.id);
            if (!mgrDeptId) return res.status(404).json({ error: 'Manager profile not found' });
            deptId = mgrDeptId;
        }

        let report;
        switch (type) {
            case 'coverage':
                report = await getShiftCoverageReport(deptId, from, to);
                break;
            case 'overtime':
                report = await getOvertimeReport(deptId, from, to);
                break;
            case 'summary':
                report = await getDepartmentShiftSummary(deptId, from, to);
                break;
            default:
                // Return all report types
                const [coverage, overtime, summary] = await Promise.all([
                    getShiftCoverageReport(deptId, from, to),
                    getOvertimeReport(deptId, from, to),
                    getDepartmentShiftSummary(deptId, from, to)
                ]);
                report = { coverage, overtime, summary };
        }

        res.status(200).json(report);
    } catch (error) {
        console.error('getShiftReports error:', error);
        res.status(500).json({ error: 'Failed to generate shift reports', details: error.message });
    }
};
