import express from 'express';
import { 
  getServices, 
  getService, 
  createService, 
  updateService, 
  deleteService 
} from '../controllers/serviceController.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadSingle } from '../middleware/upload.js';
import { validateService, validateObjectId } from '../middleware/validation.js';

const router = express.Router();

router.get('/', getServices);
router.get('/:id', validateObjectId('id'), getService);

router.post('/', protect, authorize('admin'), uploadSingle('image'), validateService, createService);
router.put('/:id', protect, authorize('admin'), uploadSingle('image'), validateObjectId('id'), validateService, updateService);
router.delete('/:id', protect, authorize('admin'), validateObjectId('id'), deleteService);

export default router;