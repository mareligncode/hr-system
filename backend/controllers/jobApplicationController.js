import { JobApplication, Applicant, JobPosting, ApplicantDocument, User } from '../models/index.js';
import sequelize from '../config/database.js';
import { sendApplicationConfirmation, notifyHRofNewApplication, sendApplicationStatusUpdate } from '../services/notificationService.js';

export const submitApplication = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { job_posting_id, first_name, last_name, email, phone, cover_letter, ...applicantData } = req.body;

        // 1. Create or update Applicant
        let applicant = await Applicant.findOne({ where: { email } }, { transaction: t });
        if (applicant) {
            await applicant.update({ first_name, last_name, phone, ...applicantData }, { transaction: t });
        } else {
            applicant = await Applicant.create({ first_name, last_name, email, phone, ...applicantData }, { transaction: t });
        }

        // 2. Check for duplicate application
        const existingApp = await JobApplication.findOne({
            where: { job_posting_id, applicant_id: applicant.id }
        }, { transaction: t });

        if (existingApp) {
            await t.rollback();
            return res.status(400).json({ error: 'You have already applied for this position' });
        }

        // 3. Create Job Application
        const application = await JobApplication.create({
            job_posting_id,
            applicant_id: applicant.id,
            cover_letter,
            resume_path: req.file ? req.file.path : null, // Assuming multer is used
            status: 'applied'
        }, { transaction: t });

        await JobPosting.increment('applications_received', {
            by: 1,
            where: { id: job_posting_id },
            transaction: t
        });

        const posting = await JobPosting.findByPk(job_posting_id, {
            include: [{ model: User, as: 'Creator', attributes: ['first_name', 'last_name', 'email'] }],
            transaction: t
        });

        await t.commit();

        // Send notifications asynchronously
        sendApplicationConfirmation(application, applicant, posting).catch(err => console.error(err));
        notifyHRofNewApplication(application, applicant, posting).catch(err => console.error(err));

        res.status(201).json({
            message: 'Application submitted successfully',
            application
        });
    } catch (error) {
        await t.rollback();
        console.error('Submit Application Error:', error);
        res.status(500).json({ error: 'Failed to submit application' });
    }
};

export const getAllApplications = async (req, res) => {
    try {
        const { job_posting_id, status } = req.query;
        const where = {};
        if (job_posting_id) where.job_posting_id = job_posting_id;
        if (status) where.status = status;

        const applications = await JobApplication.findAll({
            where,
            include: [
                { model: Applicant, attributes: ['first_name', 'last_name', 'email', 'phone'] },
                { model: JobPosting, attributes: ['title', 'reference_code'] }
            ],
            order: [['application_date', 'DESC']]
        });

        res.json(applications);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        const application = await JobApplication.findByPk(id);
        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        const history = application.status_history || [];
        history.push({
            status: application.status,
            changed_at: new Date(),
            changed_by: req.user.id,
            notes: notes
        });

        await application.update({
            status,
            notes,
            status_history: history
        });

        // Fetch relations for notification
        const applicant = await Applicant.findByPk(application.applicant_id);
        const posting = await JobPosting.findByPk(application.job_posting_id);

        // Send notification asynchronously
        if (applicant && posting) {
            sendApplicationStatusUpdate(application, applicant, posting).catch(err => console.error(err));
        }

        res.json({ message: 'Application status updated', application });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getApplicationById = async (req, res) => {
    try {
        const { id } = req.params;
        const application = await JobApplication.findByPk(id, {
            include: [
                { model: Applicant, include: [ApplicantDocument] },
                { model: JobPosting }
            ]
        });

        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        res.json(application);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getApplicationTimeline = async (req, res) => {
    try {
        const { id } = req.params;
        const application = await JobApplication.findByPk(id, {
            attributes: ['id', 'status', 'status_history', 'application_date']
        });

        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        const timeline = [
            {
                status: 'applied',
                date: application.application_date,
                notes: 'Application submitted'
            },
            ...(application.status_history || [])
        ];

        res.json(timeline);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
