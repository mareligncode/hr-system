import express from 'express';
import {
    submitExpense,
    getMyExpenses,
    getAllPendingExpenses,
    approveExpense,
    createTipPool,
    getTipPools
} from '../controllers/financialController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Employee expense routes
router.post('/expenses', submitExpense);
router.get('/expenses/me', getMyExpenses);

// Admin/Finance routes
router.get('/expenses/pending', authorize('admin', 'hr', 'finance'), getAllPendingExpenses);
router.put('/expenses/:id/approve', authorize('admin', 'hr', 'finance'), approveExpense);

router.post('/tips', authorize('admin', 'manager', 'finance'), createTipPool);
router.get('/tips', authorize('admin', 'manager', 'finance'), getTipPools);

export default router;
