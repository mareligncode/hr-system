import { Applicant, JobApplication, JobPosting, ApplicantDocument } from '../models/index.js';

export const getAllApplicants = async (req, res) => {
    try {
        const applicants = await Applicant.findAll({
            order: [['created_at', 'DESC']]
        });
        res.json(applicants);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getApplicantById = async (req, res) => {
    try {
        const { id } = req.params;
        const applicant = await Applicant.findByPk(id, {
            include: [
                {
                    model: JobApplication,
                    include: [{ model: JobPosting, attributes: ['title'] }]
                },
                {
                    model: ApplicantDocument
                }
            ]
        });

        if (!applicant) {
            return res.status(404).json({ error: 'Applicant not found' });
        }

        res.json(applicant);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateApplicant = async (req, res) => {
    try {
        const { id } = req.params;
        const applicant = await Applicant.findByPk(id);

        if (!applicant) {
            return res.status(404).json({ error: 'Applicant not found' });
        }

        await applicant.update(req.body);
        res.json({ message: 'Applicant updated successfully', applicant });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
