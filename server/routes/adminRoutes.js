import express from 'express';
import { getStats, getUsers, updateUserRole, toggleBlockUser, deleteUser } from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:userId/role', updateUserRole);
router.patch('/users/:userId/toggle-block', toggleBlockUser);
router.delete('/users/:userId', deleteUser);

export default router;
