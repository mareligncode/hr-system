import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinaryService.js';

// Configure Cloudinary storage for different types of files
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        let folder = process.env.CLOUDINARY_FOLDER || 'hr-system';

        // Extract and clean filename
        const cleanName = file.originalname
            .split('.')
            .slice(0, -1)
            .join('.')
            .replace(/[^\x00-\x7F]/g, '') // Remove emojis/non-ascii
            .replace(/\s+/g, '_') // Replace spaces with underscores
            .substring(0, 50);

        // Ensure supported formats or specific logic for documents
        if (file.fieldname === 'document') {
            folder += '/documents';
        } else if (file.fieldname === 'profile_picture') {
            folder += '/profiles';
        }

        return {
            folder: folder,
            resource_type: 'auto',
            public_id: `${Date.now()}-${cleanName}`,
        };
    },
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
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
