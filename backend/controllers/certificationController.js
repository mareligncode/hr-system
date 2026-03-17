import { EmployeeCertification } from '../models/index.js';
import { logActivity } from '../services/auditService.js';

export const addCertification = async (req, res) => {
    try {
        const certification = await EmployeeCertification.create({
            ...req.body,
            file_path: req.file ? req.file.path : null
        });

        await logActivity(req.user.id, 'CREATE', 'EmployeeCertification', certification.id, null, certification.toJSON(), req);

        res.status(201).json({
            ...certification.toJSON(),
            file_url: certification.file_url
        });
    } catch (error) {
        res.status(400).json({ error: 'Failed to add certification', details: error.message });
    }
};

export const getEmployeeCertifications = async (req, res) => {
    try {
        const certifications = await EmployeeCertification.findAll({
            where: { employee_id: req.params.employeeId }
        });
        const certsWithUrls = certifications.map(cert => ({
            ...cert.toJSON(),
            file_url: cert.file_url
        }));
        res.status(200).json(certsWithUrls);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch certifications', details: error.message });
    }
};

export const updateCertification = async (req, res) => {
    try {
        const certification = await EmployeeCertification.findByPk(req.params.id);
        if (!certification) return res.status(404).json({ error: 'Certification not found' });

        const oldValues = certification.toJSON();
        await certification.update(req.body);
        const newValues = certification.toJSON();

        await logActivity(req.user.id, 'UPDATE', 'EmployeeCertification', req.params.id, oldValues, newValues, req);

        res.status(200).json(certification);
    } catch (error) {
        res.status(400).json({ error: 'Failed to update certification', details: error.message });
    }
};

export const deleteCertification = async (req, res) => {
    try {
        const certification = await EmployeeCertification.findByPk(req.params.id);
        if (!certification) return res.status(404).json({ error: 'Certification not found' });

        const oldValues = certification.toJSON();
        await certification.destroy();

        await logActivity(req.user.id, 'DELETE', 'EmployeeCertification', req.params.id, oldValues, null, req);

        res.status(200).json({ message: 'Certification deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete certification', details: error.message });
    }
};

export const getCertificationDownloadUrl = async (req, res) => {
    try {
        const certification = await EmployeeCertification.findByPk(req.params.id);
        if (!certification || !certification.file_path) {
            return res.status(404).json({ error: 'Certification file not found' });
        }

        res.status(200).json({ download_url: certification.file_url });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate download URL', details: error.message });
    }
};
