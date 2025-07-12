import express from 'express';
import {
  bookParcel,
  getUserParcels,
  getAssignedParcels,
  getParcel,
  updateStatus,
  getStats
} from '../controllers/parcel.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();
router.post('/',              authenticate,             bookParcel);
router.get('/',               authenticate,             getUserParcels);
router.get('/assigned',       authenticate, authorize('agent'), getAssignedParcels);
router.get('/stats',          authenticate,             getStats);
router.get('/:id',            authenticate,             getParcel);
router.put('/:id/status',     authenticate,             updateStatus);

export default router;
