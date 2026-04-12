import { EmployeeDocument, Employee } from '../models/index.js';
import { logActivity } from '../services/auditService.js';
import path from 'path';
import fs from 'fs';

export const uploadDocument = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const { employee_id, document_type, issue_date, expiry_date, document_number, issuing_authority, notes } = req.body;

        // Clean document name for storage (remove emojis for database safety)
        const decodedOriginalName = decodeURIComponent(req.file.originalname);
        const cleanDocumentName = decodedOriginalName
            .replace(/[^\x00-\x7F]/g, '')
            .replace(/[|\\/?:*<>]/g, '_');

        const document = await EmployeeDocument.create({
            employee_id,
            document_type,
            document_name: cleanDocumentName || 'unnamed_document',
            file_path: req.file.path, // Local file path
            file_size: req.file.size,
            mime_type: req.file.mimetype,
            issue_date,
            expiry_date,
            document_number,
            issuing_authority,
            notes,
            created_by: req.user.id
        });

        await logActivity(req.user.id, 'UPLOAD', 'EmployeeDocument', document.id, null, document.toJSON(), req);

        res.status(201).json({
            ...document.toJSON(),
            file_url: document.file_url
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to upload document', details: error.message });
    }
};

export const getEmployeeDocuments = async (req, res) => {
    try {
        const { employeeId } = req.params;

        // Access control: only admin, HR, or the employee themselves can view
        if (req.user.role !== 'admin' && req.user.role !== 'hr' && req.user.id !== parseInt(employeeId)) {
            return res.status(403).json({ error: 'Access denied. You can only view your own documents.' });
        }

        const documents = await EmployeeDocument.findAll({
            where: { employee_id: employeeId },
            order: [['created_at', 'DESC']]
        });
        const docsWithUrls = documents.map(doc => ({
            ...doc.toJSON(),
            file_url: doc.file_url
        }));
        res.status(200).json(docsWithUrls);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch documents', details: error.message });
    }
};

export const verifyDocument = async (req, res) => {
    try {
        const document = await EmployeeDocument.findByPk(req.params.id);
        if (!document) return res.status(404).json({ error: 'Document not found' });

        const oldValues = document.toJSON();
        await document.update({
            is_verified: true,
            verified_by: req.user.id,
            verified_at: new Date()
        });
        const newValues = document.toJSON();

        await logActivity(req.user.id, 'VERIFY', 'EmployeeDocument', document.id, oldValues, newValues, req);

        res.status(200).json(document);
    } catch (error) {
        res.status(500).json({ error: 'Failed to verify document', details: error.message });
    }
};

export const deleteDocument = async (req, res) => {
    try {
        const document = await EmployeeDocument.findByPk(req.params.id);
        if (!document) return res.status(404).json({ error: 'Document not found' });

        const oldValues = document.toJSON();
        await document.destroy();

        await logActivity(req.user.id, 'DELETE', 'EmployeeDocument', req.params.id, oldValues, null, req);

        res.status(200).json({ message: 'Document deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete document', details: error.message });
    }
};


export const getDownloadUrl = async (req, res) => {
    try {
        const document = await EmployeeDocument.findByPk(req.params.id);
        if (!document) return res.status(404).json({ error: 'Document not found' });

        res.status(200).json({ download_url: document.file_url });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate download URL', details: error.message });
    }
};
