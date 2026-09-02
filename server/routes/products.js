import express from 'express';
import { 
  getProducts, 
  getProduct, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  updateStock
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadSingle } from '../middleware/upload.js';
import { validateProduct, validateObjectId } from '../middleware/validation.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', validateObjectId('id'), getProduct);

router.post('/', protect, authorize('admin'), uploadSingle('image'), validateProduct, createProduct);
router.put('/:id', protect, authorize('admin'), uploadSingle('image'), validateObjectId('id'), validateProduct, updateProduct);
router.delete('/:id', protect, authorize('admin'), validateObjectId('id'), deleteProduct);
router.put('/:id/stock', protect, authorize('admin', 'receptionist'), validateObjectId('id'), updateStock);

export default router;