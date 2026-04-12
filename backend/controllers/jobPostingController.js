import { JobPosting, Position, Department, User } from '../models/index.js';

export const createJobPosting = async (req, res) => {
    try {
        const { position_id, title, reference_code, description, ...otherData } = req.body;

        const posting = await JobPosting.create({
            position_id,
            title,
            reference_code,
            description,
            ...otherData,
            created_by: req.user.id
        });

        res.status(201).json({
            message: 'Job posting created successfully',
            posting
        });
    } catch (error) {
        console.error('Create Job Posting Error:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
};

export const getAllJobPostings = async (req, res) => {
    try {
        const { status, department_id, position_id } = req.query;
        const where = {};

        // If not HR/Admin, only show published
        if (!['hr', 'admin'].includes(req.user?.role)) {
            where.status = 'published';
        } else if (status) {
            where.status = status;
        }

        if (position_id) where.position_id = position_id;

        const include = [
            {
                model: Position,
                attributes: ['title', 'code'],
                include: [{ model: Department, attributes: ['name', 'code'] }]
            }
        ];

        if (department_id) {
            include[0].where = { department_id };
        }

        const postings = await JobPosting.findAll({
            where,
            include,
            order: [['created_at', 'DESC']]
        });

        res.json(postings);
    } catch (error) {
        console.error('Get All Job Postings Error:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
};

export const getPublicPostings = async (req, res) => {
    try {
        const postings = await JobPosting.findAll({
            where: { status: 'published' },
            include: [
                {
                    model: Position,
                    attributes: ['title'],
                    include: [{ model: Department, attributes: ['name'] }]
                }
            ],
            order: [['published_at', 'DESC']]
        });
        res.json(postings);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
};

export const getJobPostingById = async (req, res) => {
    try {
        const { id } = req.params;
        const posting = await JobPosting.findByPk(id, {
            include: [
                {
                    model: Position,
                    include: [{ model: Department, attributes: ['name', 'code'] }]
                },
                {
                    model: User,
                    as: 'Creator',
                    attributes: ['first_name', 'last_name']
                }
            ]
        });

        if (!posting) {
            return res.status(404).json({ error: 'Job posting not found' });
        }

        // If not HR/Admin, only allow viewing if published
        if (!['hr', 'admin'].includes(req.user?.role) && posting.status !== 'published') {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(posting);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateJobPosting = async (req, res) => {
    try {
        const { id } = req.params;
        const posting = await JobPosting.findByPk(id);

        if (!posting) {
            return res.status(404).json({ error: 'Job posting not found' });
        }

        await posting.update(req.body);
        res.json({ message: 'Job posting updated successfully', posting });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteJobPosting = async (req, res) => {
    try {
        const { id } = req.params;
        const posting = await JobPosting.findByPk(id);

        if (!posting) {
            return res.status(404).json({ error: 'Job posting not found' });
        }

        await posting.destroy();
        res.json({ message: 'Job posting deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const restoreJobPosting = async (req, res) => {
    try {
        const { id } = req.params;
        const posting = await JobPosting.findByPk(id, { paranoid: false });

        if (!posting) {
            return res.status(404).json({ error: 'Job posting not found' });
        }

        await posting.restore();
        res.json({ message: 'Job posting restored successfully', posting });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const publishJobPosting = async (req, res) => {
    try {
        const { id } = req.params;
        const posting = await JobPosting.findByPk(id);

        if (!posting) {
            return res.status(404).json({ error: 'Job posting not found' });
        }

        await posting.update({
            status: 'published',
            published_at: new Date()
        });

        res.json({ message: 'Job posting published successfully', posting });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
