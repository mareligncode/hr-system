import { Badge, EmployeeBadge, Employee, User } from '../models/index.js';
import { logActivity } from '../services/auditService.js';
import { createNotification } from '../services/notificationService.js';

export const getBadges = async (req, res) => {
    try {
        const badges = await Badge.findAll({ where: { is_active: true } });
        res.status(200).json(badges);
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
};

export const nominateColleague = async (req, res) => {
    try {
        const { employee_id, badge_id, reason } = req.body;

        const nomination = await EmployeeBadge.create({
            employee_id,
            badge_id,
            reason,
            nominated_by: req.user.id,
            status: 'nominated'
        });

        // Notify HR/Admin about nomination
        // In a real system, managers approve nominations before they appear on the wall

        res.status(201).json(nomination);
    } catch (error) {
        res.status(500).json({ error: 'Failed to nominate' });
    }
};

export const awardBadge = async (req, res) => {
    try {
        const { employee_id, badge_id, reason } = req.body;

        const award = await EmployeeBadge.create({
            employee_id,
            badge_id,
            reason,
            nominated_by: req.user.id,
            status: 'awarded',
            awarded_at: new Date()
        });

        await createNotification({
            userId: employee_id,
            title: '🎖️ New Achievement Awarded!',
            message: `Congratulations! You've been awarded the '${badge_id}' badge for your excellence.`,
            type: 'success',
            link: '/profile'
        });

        res.status(201).json(award);
    } catch (error) {
        res.status(500).json({ error: 'Failed to award' });
    }
};

export const getRecognitionWall = async (req, res) => {
    try {
        const recognition = await EmployeeBadge.findAll({
            where: { status: 'awarded' },
            include: [
                { model: Badge },
                { model: Employee, include: [{ model: User, attributes: ['first_name', 'last_name'] }] },
                { model: User, as: 'Nominator', attributes: ['first_name', 'last_name'] }
            ],
            order: [['awarded_at', 'DESC']],
            limit: 20
        });
        res.status(200).json(recognition);
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
};
