import express from 'express';
import {
  createDonationOrder,
  verifyDonationPayment,
} from '../controllers/donation.controller.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create-order', authMiddleware, createDonationOrder);
router.post('/verify', authMiddleware, verifyDonationPayment);

export default router;
