import { PerformanceKPI, EmployeeKPIScore, PerformanceReview, Employee, User, Department } from '../models/index.js';
import { logActivity } from '../services/auditService.js';
import { createNotification } from '../services/notificationService.js';
import { Op } from 'sequelize';

// --- KPI Management ---

export const getKPIs = async (req, res) => {
    try {
        const { category, department_id } = req.query;
        let where = { is_active: true };
        if (category) where.category = category;
        if (department_id) where.department_id = department_id;

        const kpis = await PerformanceKPI.findAll({ where, include: [Department] });
        res.status(200).json(kpis);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch KPIs' });
    }
};

export const recordKPIScore = async (req, res) => {
    try {
        const { employee_id, kpi_id, score, comments, period_start, period_end } = req.body;

        const kpiScore = await EmployeeKPIScore.create({
            employee_id,
            kpi_id,
            score,
            comments,
            period_start,
            period_end,
            recorded_by: req.user.id
        });

        await logActivity(req.user.id, 'RECORD_KPI_SCORE', 'EmployeeKPIScore', kpiScore.id, null, kpiScore.toJSON(), req);

        res.status(201).json(kpiScore);
    } catch (error) {
        res.status(500).json({ error: 'Failed to record KPI score' });
    }
};

export const getEmployeePerformanceSummary = async (req, res) => {
    try {
        const { id } = req.params; // employee user_id

        const scores = await EmployeeKPIScore.findAll({
            where: { employee_id: id },
            include: [{ model: PerformanceKPI }],
            order: [['recorded_at', 'DESC']]
        });

        const reviews = await PerformanceReview.findAll({
            where: { employee_id: id, status: 'finalized' },
            include: [{ model: User, as: 'Reviewer', attributes: ['first_name', 'last_name'] }]
        });

        res.status(200).json({ scores, reviews });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch summary' });
    }
};

// --- 360 Feedback ---

export const requestFeedback = async (req, res) => {
    try {
        const { employee_id, reviewer_id, type, period_name } = req.body;

        const review = await PerformanceReview.create({
            employee_id,
            reviewer_id,
            type,
            period_name,
            status: 'draft'
        });

        await createNotification({
            userId: reviewer_id,
            title: '📝 Feedback Request',
            message: `You have been requested to provide ${type} feedback for a colleague.`,
            type: 'info',
            link: '/performance/reviews'
        });

        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ error: 'Failed to request feedback' });
    }
};

export const submitFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, strengths, areas_for_improvement, general_comments } = req.body;

        const review = await PerformanceReview.findByPk(id);
        if (!review) return res.status(404).json({ error: 'Review request not found' });
        if (review.reviewer_id !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

        await review.update({
            rating,
            strengths,
            areas_for_improvement,
            general_comments,
            status: 'submitted'
        });

        res.status(200).json(review);
    } catch (error) {
        res.status(500).json({ error: 'Failed to submit feedback' });
    }
};
