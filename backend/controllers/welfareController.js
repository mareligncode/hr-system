import { WelfareRequest, Accommodation, Employee, User } from '../models/index.js';
import { createNotification } from '../services/notificationService.js';

// --- Welfare Requests ---

export const getWelfareRequests = async (req, res) => {
    try {
        const { status, type } = req.query;
        let where = {};
        if (status) where.status = status;
        if (type) where.request_type = type;

        // Non-admins see only theirs
        if (!['admin', 'hr'].includes(req.user.role)) {
            where.employee_id = req.user.id;
        }

        const requests = await WelfareRequest.findAll({
            where,
            include: [
                { model: Employee, include: [User] },
                { model: User, as: 'Handler', attributes: ['first_name', 'last_name'] }
            ],
            order: [['created_at', 'DESC']]
        });
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
};

export const createWelfareRequest = async (req, res) => {
    try {
        const request = await WelfareRequest.create({
            ...req.body,
            employee_id: req.user.id,
            status: 'pending'
        });

        // Notify HR
        res.status(201).json(request);
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
};

// --- Accommodations ---

export const getAccommodations = async (req, res) => {
    try {
        const rooms = await Accommodation.findAll({
            include: [{ model: Employee, include: [User] }]
        });
        res.status(200).json(rooms);
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
};

export const assignRoom = async (req, res) => {
    try {
        const { employee_id, room_id } = req.body;

        const room = await Accommodation.findByPk(room_id);
        if (!room || room.occupancy_count >= room.capacity) {
            return res.status(400).json({ error: 'Room is full or unavailable' });
        }

        const employee = await Employee.findByPk(employee_id);
        await employee.update({ accommodation_id: room_id });
        await room.increment('occupancy_count');

        res.status(200).json({ message: 'Room assigned' });
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
};
