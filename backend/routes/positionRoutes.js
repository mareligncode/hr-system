import express from 'express';
import {
    getAllPositions,
    getPositionById,
    createPosition,
    updatePosition,
    deletePosition,
    getPositionsByDepartment,
    restorePosition
} from '../controllers/positionController.js';

const router = express.Router();

router.get('/', getAllPositions);
router.post('/', createPosition);
router.get('/:id', getPositionById);
router.put('/:id', updatePosition);
router.delete('/:id', deletePosition);
router.post('/:id/restore', restorePosition);
router.get('/by-department/:departmentId', getPositionsByDepartment);

export default router;
