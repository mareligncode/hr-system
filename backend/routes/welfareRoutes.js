import express from 'express';
import {
    getAssets,
    assignAsset,
    returnAsset
} from '../controllers/assetController.js';
import {
    getWelfareRequests,
    createWelfareRequest,
    getAccommodations,
    assignRoom
} from '../controllers/welfareController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Assets
router.get('/assets', getAssets);
router.post('/assets/assign', authorize('admin', 'hr'), assignAsset);
router.put('/assets/assignments/:id/return', authorize('admin', 'hr'), returnAsset);

// Welfare
router.get('/welfare/requests', getWelfareRequests);
router.post('/welfare/requests', createWelfareRequest);

// Accommodation
router.get('/accommodation', getAccommodations);
router.post('/accommodation/assign', authorize('admin', 'hr'), assignRoom);

export default router;
