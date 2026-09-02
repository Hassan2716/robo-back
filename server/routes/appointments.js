import express from 'express';
import { 
  getAppointments, 
  getAppointment, 
  getAvailableSlotsForBarber,
  bookAppointment,
  createWalkInAppointment,
  updateAppointmentStatus,
  cancelAppointment,
  rescheduleAppointment,
  getCustomerAppointments
} from '../controllers/appointmentController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateAppointment, validateObjectId } from '../middleware/validation.js';

const router = express.Router();

router.get('/my', protect, authorize('customer'), getCustomerAppointments);
router.get('/slots', getAvailableSlotsForBarber);
router.get('/', protect, getAppointments);
router.get('/:id', protect, validateObjectId('id'), getAppointment);

router.post('/', protect, authorize('customer'), validateAppointment, bookAppointment);
router.post('/walk-in', protect, authorize('receptionist', 'admin'), validateAppointment, createWalkInAppointment);
router.put('/:id/status', protect, authorize('receptionist', 'admin', 'barber'), validateObjectId('id'), updateAppointmentStatus);
router.put('/:id/cancel', protect, validateObjectId('id'), cancelAppointment);
router.put('/:id/reschedule', protect, validateObjectId('id'), rescheduleAppointment);

export default router;