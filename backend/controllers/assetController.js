import { Asset, AssetAssignment, Employee, User } from '../models/index.js';
import { logActivity } from '../services/auditService.js';

export const getAssets = async (req, res) => {
    try {
        const { category, status } = req.query;
        let where = {};
        if (category) where.category = category;
        if (status) where.status = status;

        const assets = await Asset.findAll({
            where,
            include: [{
                model: AssetAssignment,
                where: { is_active: true },
                required: false,
                include: [{ model: Employee, include: [User] }]
            }]
        });
        res.status(200).json(assets);
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
};

export const assignAsset = async (req, res) => {
    try {
        const { asset_id, employee_id, condition_on_assign } = req.body;

        const asset = await Asset.findByPk(asset_id);
        if (!asset || asset.status !== 'available') {
            return res.status(400).json({ error: 'Asset not available' });
        }

        const assignment = await AssetAssignment.create({
            asset_id,
            employee_id,
            condition_on_assign,
            assigned_at: new Date()
        });

        await asset.update({ status: 'assigned' });

        await logActivity(req.user.id, 'ASSIGN_ASSET', 'Asset', asset_id, null, assignment.toJSON(), req);

        res.status(201).json(assignment);
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
};

export const returnAsset = async (req, res) => {
    try {
        const { id } = req.params; // assignment_id
        const { condition_on_return } = req.body;

        const assignment = await AssetAssignment.findByPk(id);
        if (!assignment || !assignment.is_active) {
            return res.status(404).json({ error: 'Active assignment not found' });
        }

        await assignment.update({
            returned_at: new Date(),
            condition_on_return,
            is_active: false
        });

        const asset = await Asset.findByPk(assignment.asset_id);
        await asset.update({ status: 'available' });

        res.status(200).json({ message: 'Asset returned' });
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
};
