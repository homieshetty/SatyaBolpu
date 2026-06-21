import { Response } from 'express';
import crypto from 'crypto';
import razorpayInstance from '../utils/razorpay.js';
import { Donation } from '../models/Donation.js';
import { AuthRequest } from '../types/globals.js';

export const createDonationOrder = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { amount } = req.body;

    // Validate amount
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a number greater than 0',
      });
    }

    // Convert amount to paise (1 INR = 100 paise)
    const amountInPaise = Math.round(amount * 100);

    // Create Razorpay order
    const order = await razorpayInstance.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `donation_${Date.now()}`,
    });

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Error creating donation order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create donation order',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const verifyDonationPayment = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } =
      req.body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment details',
      });
    }

    // Verify signature
    const hmac = crypto.createHmac(
      'sha256',
      process.env.RAZORPAY_KEY_SECRET!
    );

    const data = `${razorpay_order_id}|${razorpay_payment_id}`;
    hmac.update(data);

    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed. Invalid signature.',
      });
    }

    // Signature is valid, save donation to database
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const donation = new Donation({
      userId,
      amount,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });

    await donation.save();

    res.status(200).json({
      success: true,
      message: 'Donation successful',
      donation,
    });
  } catch (error) {
    console.error('Error verifying donation payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify donation payment',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
