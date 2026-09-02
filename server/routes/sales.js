import express from 'express';
import { 
  getSales, 
  getSale, 
  createSale, 
  getSaleReceipt,
  getDailySalesSummary
} from '../controllers/saleController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateSale, validateObjectId } from '../middleware/validation.js';

const router = express.Router();

router.get('/summary', protect, authorize('admin', 'receptionist'), getDailySalesSummary);
router.get('/receipt/:id', protect, authorize('admin', 'receptionist'), validateObjectId('id'), getSaleReceipt);
router.get('/', protect, authorize('admin', 'receptionist'), getSales);
router.get('/:id', protect, authorize('admin', 'receptionist'), validateObjectId('id'), getSale);

router.post('/', protect, authorize('receptionist', 'admin'), validateSale, createSale);

export default router;