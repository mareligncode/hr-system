import express from 'express';
import {
    addCertification,
    getEmployeeCertifications,
    updateCertification,
    deleteCertification,
    getCertificationDownloadUrl
} from '../controllers/certificationController.js';
import { protect } from '../middlewares/authMiddleware.js';
import upload from '../services/uploadService.js';

const router = express.Router();

router.use(protect);

router.post('/', upload.single('certification'), addCertification);
router.get('/employee/:employeeId', getEmployeeCertifications);
router.put('/:id', updateCertification);
router.get('/:id/download', getCertificationDownloadUrl);
router.delete('/:id', deleteCertification);

export default router;
