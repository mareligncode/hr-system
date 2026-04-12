import express from 'express';
import {
    getAllDepartments,
    getDepartmentHierarchy,
    createDepartment,
    getDepartmentById,
    updateDepartment,
    deleteDepartment,
    restoreDepartment
} from '../controllers/departmentController.js';

const router = express.Router();

router.get('/', getAllDepartments);
router.get('/hierarchy', getDepartmentHierarchy);
router.post('/', createDepartment);
router.get('/:id', getDepartmentById);
router.put('/:id', updateDepartment);
router.delete('/:id', deleteDepartment);
router.post('/:id/restore', restoreDepartment);

export default router;
