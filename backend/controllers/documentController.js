import { EmployeeDocument, Employee } from '../models/index.js';
import { logActivity } from '../services/auditService.js';
import cloudinary from '../services/cloudinaryService.js';

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
            file_path: req.file.path, // Full Cloudinary URL
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

        res.status(201).json(document);
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
        res.status(200).json(documents);
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

        // await cloudinary.uploader.destroy(public_id); // This line was in the instruction's snippet, but commented out and not part of the core logActivity change.
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

        // Extract public ID and resource type from the full Cloudinary URL
        // Example: https://res.cloudinary.com/cloud_name/image/upload/v12345/folder/public_id.jpg
        const urlParts = document.file_path.split('/');
        const uploadIndex = urlParts.indexOf('upload');

        if (uploadIndex === -1) {
            throw new Error('Invalid Cloudinary URL');
        }

        const resourceType = urlParts[uploadIndex - 1] || 'image';

        // Everything after /upload/ (skipping version if present)
        let filePathParts = urlParts.slice(uploadIndex + 1);
        if (filePathParts[0].startsWith('v') && !isNaN(filePathParts[0].substring(1))) {
            filePathParts.shift();
        }

        const fullIdWithExt = filePathParts.join('/');

        // For 'raw' files (PDF, Doc), public_id includes extension
        // For 'image', public_id must NOT include extension in the url() helper
        let publicId = fullIdWithExt;
        if (resourceType === 'image' || resourceType === 'video') {
            publicId = fullIdWithExt.split('.').slice(0, -1).join('.');
        }

        // Generate a signed URL that forces download with the original filename
        const downloadUrl = cloudinary.url(publicId, {
            secure: true,
            sign_url: true,
            resource_type: resourceType,
            type: 'upload',
            flags: 'attachment',
            attachment: document.document_name // Forces browser to download with this name
        });

        res.status(200).json({ download_url: downloadUrl });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate download URL', details: error.message });
    }
};
