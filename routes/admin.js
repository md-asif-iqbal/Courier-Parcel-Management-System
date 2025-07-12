import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { adminStats, getAllUsers, updateUserRole,deleteUser,assignParcel, getAllParcels, getAnalytics, generateParcelReport, generateParcelPDF, generateParcelExcel } from '../controllers/admin.js';

const router = express.Router();

typeof authenticate; 
router.get('/stats', authenticate, authorize('admin'), adminStats);
router.get('/users', authenticate, authorize('admin'), getAllUsers);
router.put('/users/:id', authenticate, authorize('admin'), updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/parcels',          getAllParcels);
router.put('/parcels/:id/assign', authenticate, authorize('admin'), assignParcel);
router.get('/analytics',       getAnalytics);
router.get('/reports/parcels', generateParcelReport);
router.get('/reports/parcels/excel',  generateParcelExcel);
router.get('/reports/parcels/pdf',    generateParcelPDF);

export default router;