import { Employee, Department, Position, EmployeeDocument, EmployeeCertification, User, AuditLog, Attendance, PayrollItem, PayrollPeriod, JobPosting } from '../models/index.js';
import { Op } from 'sequelize';

export const getDashboardStats = async (req, res) => {
    try {
        let whereClause = {};
        let managerDeptId = null;

        if (req.user.role === 'manager') {
            const managerEmployee = await Employee.findOne({ where: { user_id: req.user.id } });
            if (managerEmployee) {
                managerDeptId = managerEmployee.department_id;
                whereClause = { department_id: managerDeptId };
            }
        }

        const totalEmployees = await Employee.count({ where: whereClause });
        const totalDepartments = managerDeptId ? 1 : await Department.count();

        // Open Positions should reflect active job postings
        const jobPostingWhere = { status: 'published' };
        const totalPositions = await JobPosting.count({
            where: jobPostingWhere,
            include: managerDeptId ? [{
                model: Position,
                where: { department_id: managerDeptId },
                attributes: []
            }] : []
        });

        const activeCertifications = await EmployeeCertification.count({
            where: {
                expiry_date: { [Op.gt]: new Date() }
            },
            include: managerDeptId ? [{
                model: Employee,
                where: { department_id: managerDeptId },
                attributes: []
            }] : []
        });

        const deptStatsWhere = managerDeptId ? { id: managerDeptId } : {};
        const deptStats = await Department.findAll({
            where: deptStatsWhere,
            attributes: ['name', [Employee.sequelize.fn('COUNT', Employee.sequelize.col('Employees.user_id')), 'employee_count']],
            include: [{
                model: Employee,
                attributes: []
            }],
            group: ['Department.id', 'Department.name']
        });

        // Contract Distribution (Permanent vs Temporary) - useful for HR/Admin/Finance
        const contractStats = await Employee.findAll({
            where: whereClause,
            attributes: ['contract_type', [Employee.sequelize.fn('COUNT', Employee.sequelize.col('user_id')), 'count']],
            group: ['contract_type']
        });

        // ─── Time Series Data for Charts ───────────────────────────────────────────

        // 1. Attendance Trends (Last 4 Weeks)
        const fourWeeksAgo = new Date();
        fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
        const attendanceTrends = await Attendance.findAll({
            where: {
                clock_in: { [Op.gte]: fourWeeksAgo },
                status: 'approved'
            },
            attributes: [
                [Employee.sequelize.fn('TO_CHAR', Employee.sequelize.col('clock_in'), 'YYYY-IW'), 'week'],
                [Employee.sequelize.fn('COUNT', Employee.sequelize.col('id')), 'count'],
                [Employee.sequelize.fn('SUM', Employee.sequelize.col('work_hours')), 'total_hours']
            ],
            group: [Employee.sequelize.fn('TO_CHAR', Employee.sequelize.col('clock_in'), 'YYYY-IW')],
            order: [[Employee.sequelize.fn('TO_CHAR', Employee.sequelize.col('clock_in'), 'YYYY-IW'), 'ASC']]
        });

        // 2. Payroll Trends (Last 6 Months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const payrollTrends = await PayrollPeriod.findAll({
            where: {
                end_date: { [Op.gte]: sixMonthsAgo },
                status: 'approved'
            },
            attributes: [
                'end_date',
                'description',
                [Employee.sequelize.fn('SUM', Employee.sequelize.col('PayrollItems.gross_pay')), 'total_payroll']
            ],
            include: [{
                model: PayrollItem,
                attributes: [],
                required: false
            }],
            group: ['PayrollPeriod.id', 'PayrollPeriod.end_date', 'PayrollPeriod.description'],
            order: [['end_date', 'ASC']],
            raw: true
        });

        // 3. Employee Growth (Last 6 Months)
        // This is a bit more complex as we need cumulative count, but we can return monthly hires
        const employeeGrowth = await Employee.findAll({
            where: {
                hire_date: { [Op.gte]: sixMonthsAgo }
            },
            attributes: [
                [Employee.sequelize.fn('TO_CHAR', Employee.sequelize.col('hire_date'), 'YYYY-MM'), 'month'],
                [Employee.sequelize.fn('COUNT', Employee.sequelize.col('user_id')), 'hires']
            ],
            group: [Employee.sequelize.fn('TO_CHAR', Employee.sequelize.col('hire_date'), 'YYYY-MM')],
            order: [[Employee.sequelize.fn('TO_CHAR', Employee.sequelize.col('hire_date'), 'YYYY-MM'), 'ASC']]
        });

        res.status(200).json({
            metrics: {
                totalEmployees,
                totalDepartments,
                totalPositions,
                activeCertifications
            },
            departmentDistribution: deptStats,
            contractDistribution: contractStats,
            attendanceTrends,
            payrollTrends,
            employeeGrowth,
            isScoped: !!managerDeptId
        });
    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
};

export const getExpiringAssets = async (req, res) => {
    try {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        let managerDeptId = null;
        if (req.user.role === 'manager') {
            const managerEmployee = await Employee.findOne({ where: { user_id: req.user.id } });
            if (managerEmployee) {
                managerDeptId = managerEmployee.department_id;
            }
        }

        const employeeInclude = {
            model: Employee,
            include: [{ model: User, attributes: ['first_name', 'last_name', 'email'] }]
        };

        if (managerDeptId) {
            employeeInclude.where = { department_id: managerDeptId };
        }

        const expiringDocs = await EmployeeDocument.findAll({
            where: {
                expiry_date: {
                    [Op.between]: [new Date(), thirtyDaysFromNow]
                }
            },
            include: [employeeInclude]
        });

        const expiringCerts = await EmployeeCertification.findAll({
            where: {
                expiry_date: {
                    [Op.between]: [new Date(), thirtyDaysFromNow]
                }
            },
            include: [employeeInclude]
        });

        res.status(200).json({
            documents: expiringDocs,
            certifications: expiringCerts
        });
    } catch (error) {
        console.error('Expiring Assets Error:', error);
        res.status(500).json({ error: 'Failed to fetch expiring assets' });
    }
};

export const getRecentActivity = async (req, res) => {
    try {
        const recentLogs = await AuditLog.findAll({
            limit: 10,
            order: [['created_at', 'DESC']],
            include: [{ model: User, attributes: ['first_name', 'last_name', 'profile_picture'] }]
        });
        res.status(200).json(recentLogs);
    } catch (error) {
        console.error('Recent Activity Error:', error);
        res.status(500).json({ error: 'Failed to fetch recent activity' });
    }
};

export const getEmployeeDashboard = async (req, res) => {
    try {
        const userId = req.user.id;

        const employee = await Employee.findOne({
            where: { user_id: userId },
            include: [
                { model: Department, attributes: ['id', 'name', 'code'] },
                { model: Position, attributes: ['id', 'title', 'code', 'job_description'] },
                { model: User, as: 'Manager', attributes: ['id', 'first_name', 'last_name', 'email'] }
            ]
        });

        if (!employee) {
            // If user is Admin/HR, they might not have an employee profile, return empty stats instead of 404
            if (['admin', 'hr'].includes(req.user.role)) {
                return res.status(200).json({
                    profile: { employee_number: '-', status: 'N/A' },
                    organization: { department: null, position: null, manager: null },
                    stats: { totalDocuments: 0, verifiedDocuments: 0, expiringDocuments: 0, totalCertifications: 0, verifiedCertifications: 0, expiringCertifications: 0 }
                });
            }
            return res.status(404).json({ error: 'Employee profile not found' });
        }

        // Get document stats
        const documentStats = await EmployeeDocument.findAll({
            where: { employee_id: userId },
            attributes: ['id', 'document_name', 'document_type', 'expiry_date', 'is_verified']
        });

        // Get certification stats
        const certificationStats = await EmployeeCertification.findAll({
            where: { employee_id: userId },
            attributes: ['id', 'certification_name', 'expiry_date', 'is_verified']
        });

        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const expiringDocsCount = documentStats.filter(d =>
            d.expiry_date && new Date(d.expiry_date) > new Date() && new Date(d.expiry_date) <= thirtyDaysFromNow
        ).length;

        const expiringCertsCount = certificationStats.filter(c =>
            c.expiry_date && new Date(c.expiry_date) > new Date() && new Date(c.expiry_date) <= thirtyDaysFromNow
        ).length;

        res.status(200).json({
            profile: {
                employee_number: employee.employee_number,
                hire_date: employee.hire_date,
                employment_status: employee.employment_status,
                contract_type: employee.contract_type
            },
            organization: {
                department: employee.Department || employee.department,
                position: employee.Position || employee.position,
                manager: employee.Manager || employee.manager
            },
            stats: {
                totalDocuments: documentStats.length,
                verifiedDocuments: documentStats.filter(d => d.is_verified).length,
                expiringDocuments: expiringDocsCount,
                totalCertifications: certificationStats.length,
                verifiedCertifications: certificationStats.filter(c => c.is_verified).length,
                expiringCertifications: expiringCertsCount
            }
        });
    } catch (error) {
        console.error('Employee Dashboard Error:', error);
        res.status(500).json({ error: 'Failed to fetch employee dashboard data' });
    }
};
