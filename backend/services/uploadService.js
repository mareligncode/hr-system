import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configuration for local storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder = 'uploads';

        // Map fieldnames to subfolders
        if (file.fieldname === 'resume') {
            folder = 'uploads/resumes';
        } else if (file.fieldname === 'document') {
            folder = 'uploads/documents';
        } else if (file.fieldname === 'certification') {
            folder = 'uploads/certifications';
        } else if (file.fieldname === 'profile_picture') {
            folder = 'uploads/profiles';
        }

        // Ensure directory exists
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, { recursive: true });
        }

        cb(null, folder);
    },
    filename: (req, file, cb) => {
        // Create unique filename: timestamp-originalName (sanitized)
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const cleanName = path.basename(file.originalname, ext)
            .replace(/[^\x00-\x7F]/g, '') // Remove non-ascii
            .replace(/\s+/g, '_')         // Replace spaces
            .substring(0, 50);            // Limit length

        cb(null, `${cleanName}-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // Increased to 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Unsupported file type. Allowed: JPG, PNG, PDF, DOC, DOCX'), false);
        }
    }
});

export default upload;
