import express from 'express';
import { 
  getBarbers, 
  getBarber, 
  createBarber, 
  updateBarber, 
  deleteBarber,
  getMyBarberProfile,
  updateMyBarberProfile
} from '../controllers/barberController.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadSingle } from '../middleware/upload.js';
import { validateBarber, validateObjectId } from '../middleware/validation.js';

const router = express.Router();

router.get('/', getBarbers);
router.get('/me', protect, authorize('barber'), getMyBarberProfile);
router.put('/me', protect, authorize('barber'), uploadSingle('photo'), updateMyBarberProfile);
router.get('/:id', validateObjectId('id'), getBarber);

router.post('/', protect, authorize('admin'), uploadSingle('photo'), validateBarber, createBarber);
router.put('/:id', protect, authorize('admin'), uploadSingle('photo'), validateObjectId('id'), validateBarber, updateBarber);
router.delete('/:id', protect, authorize('admin'), validateObjectId('id'), deleteBarber);

export default router;