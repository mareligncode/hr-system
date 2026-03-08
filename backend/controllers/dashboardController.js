import { Employee, Department, Position, EmployeeDocument, EmployeeCertification, User, AuditLog } from '../models/index.js';
import { Op } from 'sequelize';

export const getDashboardStats = async (req, res) => {
    try {
        const totalEmployees = await Employee.count();
        const totalDepartments = await Department.count();
        const totalPositions = await Position.count();

        // Count active certifications
        const activeCertifications = await EmployeeCertification.count({
            where: {
                expiry_date: {
                    [Op.gt]: new Date()
                }
            }
        });

        // Get counts by department
        const deptStats = await Department.findAll({
            attributes: ['name', [Employee.sequelize.fn('COUNT', Employee.sequelize.col('Employees.user_id')), 'employee_count']],
            include: [{
                model: Employee,
                attributes: []
            }],
            group: ['Department.id']
        });

        res.status(200).json({
            metrics: {
                totalEmployees,
                totalDepartments,
                totalPositions,
                activeCertifications
            },
            departmentDistribution: deptStats
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

        const expiringDocs = await EmployeeDocument.findAll({
            where: {
                expiry_date: {
                    [Op.between]: [new Date(), thirtyDaysFromNow]
                }
            },
            include: [{
                model: Employee,
                include: [{ model: User, attributes: ['first_name', 'last_name', 'email'] }]
            }]
        });

        const expiringCerts = await EmployeeCertification.findAll({
            where: {
                expiry_date: {
                    [Op.between]: [new Date(), thirtyDaysFromNow]
                }
            },
            include: [{
                model: Employee,
                include: [{ model: User, attributes: ['first_name', 'last_name', 'email'] }]
            }]
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
