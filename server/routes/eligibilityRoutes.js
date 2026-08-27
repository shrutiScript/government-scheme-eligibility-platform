import express from 'express';
import { checkEligibility, getRecommendations } from '../controllers/eligibilityController.js';
import { optionalProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/check', optionalProtect, checkEligibility);
router.get('/recommendations', optionalProtect, getRecommendations);

export default router;
