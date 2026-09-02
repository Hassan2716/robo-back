import express from 'express';
import { 
  getDashboardStats, 
  getBookingReport, 
  getRevenueReport, 
  getBarberPerformance,
  getProductReport
} from '../controllers/reportController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', protect, authorize('admin', 'receptionist'), getDashboardStats);
router.get('/bookings', protect, authorize('admin', 'receptionist'), getBookingReport);
router.get('/revenue', protect, authorize('admin', 'receptionist'), getRevenueReport);
router.get('/barbers', protect, authorize('admin'), getBarberPerformance);
router.get('/products', protect, authorize('admin', 'receptionist'), getProductReport);

export default router;