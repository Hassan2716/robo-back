import express from 'express';
import { 
  submitContact, 
  getContacts, 
  getContact, 
  updateContactStatus, 
  deleteContact 
} from '../controllers/contactController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateContact, validateObjectId } from '../middleware/validation.js';

const router = express.Router();

router.post('/', validateContact, submitContact);

router.get('/', protect, authorize('admin', 'receptionist'), getContacts);
router.get('/:id', protect, authorize('admin', 'receptionist'), validateObjectId('id'), getContact);
router.put('/:id/status', protect, authorize('admin', 'receptionist'), validateObjectId('id'), updateContactStatus);
router.delete('/:id', protect, authorize('admin'), validateObjectId('id'), deleteContact);

export default router;