import express from 'express';
import { checkEligibility, getRecommendations } from '../controllers/eligibilityController.js';

const router = express.Router();

router.post('/check', checkEligibility);
router.get('/recommendations', getRecommendations);

export default router;
