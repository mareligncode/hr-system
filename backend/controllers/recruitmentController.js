import { JobPosting, Applicant, JobApplication, Interview, Offer, Position, Department, User } from '../models/index.js';
import { logActivity } from '../services/auditService.js';
import { createNotification } from '../services/notificationService.js';

// --- Job Postings ---

export const getJobPostings = async (req, res) => {
    try {
        const { status } = req.query;
        let where = {};
        if (status) where.status = status;

        const jobs = await JobPosting.findAll({
            where,
            include: [{ model: Position, include: [Department] }]
        });
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
};

export const createJobPosting = async (req, res) => {
    try {
        const job = await JobPosting.create({ ...req.body, created_by: req.user.id });
        res.status(201).json(job);
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
};

// --- Applicant Tracking (ATS) ---

export const getApplicants = async (req, res) => {
    try {
        const applicants = await Applicant.findAll({
            include: [{
                model: JobApplication,
                include: [JobPosting]
            }]
        });
        res.status(200).json(applicants);
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
};

export const updateApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        const application = await JobApplication.findByPk(id);
        if (!application) return res.status(404).json({ error: 'Not found' });

        await application.update({ status, notes });

        // If hired, we might trigger some onboarding logic here

        res.status(200).json(application);
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
};

// --- Interviews ---

export const scheduleInterview = async (req, res) => {
    try {
        const interview = await Interview.create(req.body);
        // Notify interviewer and applicant
        res.status(201).json(interview);
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
};

export const getInterviews = async (req, res) => {
    try {
        const interviews = await Interview.findAll({
            include: [
                { model: JobApplication, include: [Applicant, JobPosting] },
                { model: User, as: 'Interviewer', attributes: ['first_name', 'last_name'] }
            ]
        });
        res.status(200).json(interviews);
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
};
