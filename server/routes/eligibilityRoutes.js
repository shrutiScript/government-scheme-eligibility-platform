import express from 'express';
import { checkEligibility, getRecommendations } from '../controllers/eligibilityController.js';
<<<<<<< HEAD

const router = express.Router();

router.post('/check', checkEligibility);
router.get('/recommendations', getRecommendations);
=======
import { optionalProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/check', optionalProtect, checkEligibility);
router.get('/recommendations', optionalProtect, getRecommendations);
>>>>>>> second-copy

export default router;
