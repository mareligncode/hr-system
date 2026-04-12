import { Offer, JobApplication, JobPosting, User, Applicant } from '../models/index.js';

export const createOffer = async (req, res) => {
    try {
        const { job_application_id, offer_date, expiry_date, joining_date, base_salary, bonus_potential, benefits, notes } = req.body;

        // Verify job application exists
        const application = await JobApplication.findByPk(job_application_id);
        if (!application) {
            return res.status(404).json({ error: 'Job application not found' });
        }

        // Check if an offer already exists for this application
        const existingOffer = await Offer.findOne({ where: { job_application_id } });
        if (existingOffer) {
            return res.status(400).json({ error: 'An offer already exists for this application' });
        }

        const offer = await Offer.create({
            job_application_id,
            offer_date,
            expiry_date,
            joining_date,
            base_salary,
            bonus_potential,
            benefits,
            notes,
            created_by: req.user.id
        });

        // Update application status to 'offer'
        await application.update({ status: 'offer' });

        res.status(201).json(offer);
    } catch (error) {
        console.error('Error creating offer:', error);
        res.status(500).json({ error: 'Failed to create offer' });
    }
};

export const getOffers = async (req, res) => {
    try {
        const { status } = req.query;
        const where = {};
        if (status) where.status = status;

        const offers = await Offer.findAll({
            where,
            include: [
                {
                    model: JobApplication,
                    include: [
                        { model: JobPosting, attributes: ['title'] },
                        { model: Applicant, attributes: ['first_name', 'last_name', 'email'] }
                    ]
                },
                { model: User, as: 'Creator', attributes: ['first_name', 'last_name'] }
            ]
        });

        res.json(offers);
    } catch (error) {
        console.error('Error fetching offers:', error);
        res.status(500).json({ error: 'Failed to fetch offers' });
    }
};

export const getOfferById = async (req, res) => {
    try {
        const offer = await Offer.findByPk(req.params.id, {
            include: [
                {
                    model: JobApplication,
                    include: [
                        { model: JobPosting, attributes: ['title'] },
                        { model: Applicant, attributes: ['first_name', 'last_name', 'email'] }
                    ]
                },
                { model: User, as: 'Creator', attributes: ['first_name', 'last_name'] }
            ]
        });

        if (!offer) {
            return res.status(404).json({ error: 'Offer not found' });
        }

        res.json(offer);
    } catch (error) {
        console.error('Error fetching offer:', error);
        res.status(500).json({ error: 'Failed to fetch offer' });
    }
};

export const updateOffer = async (req, res) => {
    try {
        const offer = await Offer.findByPk(req.params.id);
        if (!offer) {
            return res.status(404).json({ error: 'Offer not found' });
        }

        const { offer_date, expiry_date, joining_date, base_salary, bonus_potential, benefits, notes, status } = req.body;

        const updates = { offer_date, expiry_date, joining_date, base_salary, bonus_potential, benefits, notes, status };

        if (status === 'sent' && offer.status !== 'sent') {
            updates.sent_at = new Date();
        }

        await offer.update(updates);
        res.json(offer);
    } catch (error) {
        console.error('Error updating offer:', error);
        res.status(500).json({ error: 'Failed to update offer' });
    }
};

export const acceptOffer = async (req, res) => {
    try {
        const offer = await Offer.findByPk(req.params.id);
        if (!offer) {
            return res.status(404).json({ error: 'Offer not found' });
        }

        await offer.update({
            status: 'accepted',
            accepted_at: new Date()
        });

        // Update application status to 'hired'
        const application = await JobApplication.findByPk(offer.job_application_id);
        if (application) {
            await application.update({ status: 'hired' });
        }

        res.json({ message: 'Offer accepted successfully', offer });
    } catch (error) {
        console.error('Error accepting offer:', error);
        res.status(500).json({ error: 'Failed to accept offer' });
    }
};

export const rejectOffer = async (req, res) => {
    try {
        const { rejection_reason } = req.body;
        const offer = await Offer.findByPk(req.params.id);
        if (!offer) {
            return res.status(404).json({ error: 'Offer not found' });
        }

        await offer.update({
            status: 'rejected',
            rejected_at: new Date(),
            rejection_reason
        });

        // Update application status to 'rejected'
        const application = await JobApplication.findByPk(offer.job_application_id);
        if (application) {
            await application.update({ status: 'rejected' });
        }

        res.json({ message: 'Offer rejected successfully', offer });
    } catch (error) {
        console.error('Error rejecting offer:', error);
        res.status(500).json({ error: 'Failed to reject offer' });
    }
};

export default {
    createOffer,
    getOffers,
    getOfferById,
    updateOffer,
    acceptOffer,
    rejectOffer
};
