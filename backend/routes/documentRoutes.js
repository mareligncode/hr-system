import express from 'express';
import {
    uploadDocument,
    getEmployeeDocuments,
    verifyDocument,
    deleteDocument,
    getDownloadUrl
} from '../controllers/documentController.js';
import { protect } from '../middlewares/authMiddleware.js';
import upload from '../services/uploadService.js';

const router = express.Router();

router.use(protect);

router.post('/', upload.single('document'), uploadDocument);
router.get('/employee/:employeeId', getEmployeeDocuments);
router.get('/:id/download', getDownloadUrl);
router.patch('/:id/verify', verifyDocument);
router.delete('/:id', deleteDocument);

export default router;
