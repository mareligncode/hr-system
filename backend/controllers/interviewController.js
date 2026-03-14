import { Interview, InterviewFeedback, JobApplication, JobPosting, User, Applicant } from '../models/index.js';
import { generateJitsiLink } from '../services/jitsiService.js';
import { sendInterviewInvitation } from '../services/notificationService.js';

export const scheduleInterview = async (req, res) => {
    try {
        const { job_application_id, interviewer_id, scheduled_at, duration_minutes, interview_type, interview_round, location, notes } = req.body;

        // Verify job application exists
        const application = await JobApplication.findByPk(job_application_id, {
            include: [
                {
                    model: JobPosting,
                    attributes: ['title', 'reference_code'],
                    include: [{ model: User, as: 'Creator', attributes: ['first_name', 'last_name', 'email'] }]
                },
                {
                    model: Applicant,
                    attributes: ['first_name', 'last_name', 'email']
                }
            ]
        });

        if (!application) {
            return res.status(404).json({ error: 'Job application not found' });
        }

        let meeting_link = null;
        if (interview_type === 'online') {
            meeting_link = generateJitsiLink(
                application.JobPosting.title,
                `${application.Applicant.first_name}${application.Applicant.last_name}`,
                interview_round || 1
            );
        }

        const interview = await Interview.create({
            job_application_id,
            interviewer_id,
            scheduled_at,
            duration_minutes,
            interview_type,
            interview_round: interview_round || 1,
            location,
            meeting_link,
            notes,
            created_by: req.user.id
        });

        // Update application status to 'interview' if it's not already
        if (application.status !== 'interview') {
            await application.update({ status: 'interview' });
        }

        // Send notification to applicant
        await sendInterviewInvitation(
            interview,
            application,
            application.Applicant,
            application.JobPosting
        );

        res.status(201).json(interview);
    } catch (error) {
        console.error('Error scheduling interview:', error);
        res.status(500).json({ error: 'Failed to schedule interview' });
    }
};

export const getInterviews = async (req, res) => {
    try {
        const { job_application_id, interviewer_id, status } = req.query;
        const where = {};
        if (job_application_id) where.job_application_id = job_application_id;
        if (interviewer_id) where.interviewer_id = interviewer_id;
        if (status) where.status = status;

        const interviews = await Interview.findAll({
            where,
            include: [
                {
                    model: JobApplication,
                    include: [
                        { model: JobPosting, attributes: ['title'] },
                        { model: Applicant, attributes: ['first_name', 'last_name', 'email'] }
                    ]
                },
                { model: User, as: 'Interviewer', attributes: ['first_name', 'last_name', 'email'] }
            ],
            order: [['scheduled_at', 'ASC']]
        });

        res.json(interviews);
    } catch (error) {
        console.error('Error fetching interviews:', error);
        res.status(500).json({ error: 'Failed to fetch interviews' });
    }
};

export const getInterviewById = async (req, res) => {
    try {
        const interview = await Interview.findByPk(req.params.id, {
            include: [
                {
                    model: JobApplication,
                    include: [
                        { model: JobPosting, attributes: ['title'] },
                        { model: Applicant, attributes: ['first_name', 'last_name', 'email'] }
                    ]
                },
                { model: User, as: 'Interviewer', attributes: ['first_name', 'last_name', 'email'] },
                { model: InterviewFeedback, include: [{ model: User, as: 'Interviewer', attributes: ['first_name', 'last_name'] }] }
            ]
        });

        if (!interview) {
            return res.status(404).json({ error: 'Interview not found' });
        }

        res.json(interview);
    } catch (error) {
        console.error('Error fetching interview:', error);
        res.status(500).json({ error: 'Failed to fetch interview' });
    }
};

export const updateInterview = async (req, res) => {
    try {
        const interview = await Interview.findByPk(req.params.id);
        if (!interview) {
            return res.status(404).json({ error: 'Interview not found' });
        }

        const { scheduled_at, duration_minutes, interview_type, location, notes, status } = req.body;

        const updates = { scheduled_at, duration_minutes, interview_type, location, notes, status };

        // If rescheduling, increment reschedule count
        if (scheduled_at && scheduled_at !== interview.scheduled_at.toISOString()) {
            updates.reschedule_count = interview.reschedule_count + 1;
        }

        await interview.update(updates);
        res.json(interview);
    } catch (error) {
        console.error('Error updating interview:', error);
        res.status(500).json({ error: 'Failed to update interview' });
    }
};

export const submitFeedback = async (req, res) => {
    try {
        const { interview_id, feedback_text, strengths, weaknesses, technical_score, communication_score, cultural_fit_score, overall_score, recommendation } = req.body;

        const interview = await Interview.findByPk(interview_id);
        if (!interview) {
            return res.status(404).json({ error: 'Interview not found' });
        }

        const feedback = await InterviewFeedback.create({
            interview_id,
            interviewer_id: req.user.id,
            feedback_text,
            strengths,
            weaknesses,
            technical_score,
            communication_score,
            cultural_fit_score,
            overall_score,
            recommendation
        });

        // Mark interview as completed
        await interview.update({ status: 'completed' });

        res.status(201).json(feedback);
    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({ error: 'Failed to submit feedback' });
    }
};

export default {
    scheduleInterview,
    getInterviews,
    getInterviewById,
    updateInterview,
    submitFeedback
};
