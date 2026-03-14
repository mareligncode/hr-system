import express from 'express';
import offerController from '../controllers/offerController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes for candidates (might need token-based authentication later, for now we can use simple auth or public)
router.post('/:id/accept', offerController.acceptOffer);
router.post('/:id/reject', offerController.rejectOffer);

// Authenticated routes
router.use(protect);

router.post('/', authorize('admin', 'hr', 'hr_manager'), offerController.createOffer);
router.get('/', authorize('admin', 'hr', 'hr_manager'), offerController.getOffers);
router.get('/:id', authorize('admin', 'hr', 'hr_manager'), offerController.getOfferById);
router.put('/:id', authorize('admin', 'hr', 'hr_manager'), offerController.updateOffer);

export default router;
