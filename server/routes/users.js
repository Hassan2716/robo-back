import express from 'express';
import { getUsers, getUser, updateUser, deleteUser } from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateObjectId } from '../middleware/validation.js';

const router = express.Router();

router.get('/', protect, authorize('admin'), getUsers);
router.get('/:id', protect, authorize('admin'), validateObjectId('id'), getUser);
router.put('/:id', protect, authorize('admin'), validateObjectId('id'), updateUser);
router.delete('/:id', protect, authorize('admin'), validateObjectId('id'), deleteUser);

export default router;