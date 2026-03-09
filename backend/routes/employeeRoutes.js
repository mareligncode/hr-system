import express from 'express';
import {
    getAllEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    exportEmployees
} from '../controllers/employeeController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import upload from '../services/uploadService.js';

const router = express.Router();

router.use(protect);

router.get('/export', authorize('admin', 'hr', 'manager'), exportEmployees);
router.get('/', authorize('admin', 'hr', 'manager'), getAllEmployees);
router.get('/:id', authorize('admin', 'hr', 'manager', 'employee'), getEmployeeById);
router.post('/', authorize('admin', 'hr'), upload.single('profile_picture'), createEmployee);
router.put('/:id', authorize('admin', 'hr', 'manager', 'employee'), upload.single('profile_picture'), updateEmployee);
router.delete('/:id', authorize('admin', 'hr'), deleteEmployee);

export default router;
