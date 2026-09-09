import express from 'express';
<<<<<<< HEAD
import { getStats, getUsers, updateUserRole, toggleBlockUser, deleteUser } from '../controllers/adminController.js';
=======
import { getStats, getLogs, getUsers, updateUserRole, toggleBlockUser, deleteUser, updateUser } from '../controllers/adminController.js';
>>>>>>> second-copy
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get('/stats', getStats);
<<<<<<< HEAD
router.get('/users', getUsers);
=======
router.get('/logs', getLogs);
router.get('/users', getUsers);
router.put('/users/:userId', updateUser);
>>>>>>> second-copy
router.put('/users/:userId/role', updateUserRole);
router.patch('/users/:userId/toggle-block', toggleBlockUser);
router.delete('/users/:userId', deleteUser);

export default router;
