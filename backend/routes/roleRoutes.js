import express from 'express';
import {
    createRole,
    getRoles,
    updateRole,
    deleteRole,
    assignRoleToUser,
    unassignRoleFromUser,
    getPermissions
} from '../controllers/roleController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'hr')); // Only HR and Admins can manage RBAC

router.get('/', getRoles);
router.post('/', createRole);
router.get('/permissions', getPermissions);
router.post('/assign', assignRoleToUser);
router.post('/unassign', unassignRoleFromUser);  // POST not DELETE — DELETE with body is unreliable
router.put('/:id', updateRole);
router.delete('/:id', deleteRole);

export default router;
