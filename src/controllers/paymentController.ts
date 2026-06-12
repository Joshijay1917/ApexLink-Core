import { Request, Response } from 'express';
import crypto from 'crypto';
import Transaction from '../models/Transaction';
import Subscription from '../models/Subscription';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { uploadOnCloudinary } from '../utils/cloudinary';
import User from '../models/User';

const UPI_ID = 'apexlink@paytm'; // Replace with real UPI ID
const PAYEE_NAME = 'ApexLink Premium';

export const createPaymentIntent = asyncHandler(async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user?.id;
  const { planType } = req.body;

  if (!planType || !['PRO_999', 'PRO_1499'].includes(planType)) {
    throw new ApiError(400, 'Invalid plan type');
  }

  const amount = planType === 'PRO_999' ? 999 : 1499;
  const transactionId = `TXN-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;

  // Create pending transaction in DB
  await Transaction.create({
    userId,
    transactionId,
    amount,
    currency: 'INR',
    status: 'pending'
  });

  const upiIntentUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(PAYEE_NAME)}&tr=${transactionId}&am=${amount}&cu=INR`;

  res.status(200).json(new ApiResponse(200, {
    transactionId,
    amount,
    upiIntentUrl,
    upiId: UPI_ID
  }, 'Payment intent created successfully'));
});

export const verifyPayment = asyncHandler(async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user?.id;
  const { transactionId, utr, planType } = req.body;
  
  // @ts-ignore
  const fileLocalPath = req.file?.path;

  if (!transactionId || !utr) {
    throw new ApiError(400, 'Transaction ID and UTR is required');
  }

  const user = await User.findById(userId)
  if(!user) {
    throw new ApiError(404, 'User not found!')
  }

  const transaction = await Transaction.findOne({ transactionId, userId });
  if (!transaction) {
    throw new ApiError(404, 'Transaction not found');
  }

  if (transaction.status === 'verified') {
    throw new ApiError(400, 'Transaction already verified');
  }

  // Update transaction status
  // transaction.status = 'verified';
  transaction.utr = utr;
  user.subscriptionStatus = planType;

  if (fileLocalPath) {
    // Upload to cloudinary (utils/cloudinary.js automatically deletes local file)
    const cloudinaryResponse = await uploadOnCloudinary(fileLocalPath);
    if (cloudinaryResponse && cloudinaryResponse.url) {
      transaction.screenshotUrl = cloudinaryResponse.url;
    }
  }

  await transaction.save();
  await user.save();

  // Create or Update Subscription
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 30); // Add 30 days

  await Subscription.findOneAndUpdate(
    { userId },
    {
      planType: planType || (transaction.amount === 999 ? 'PRO_999' : 'PRO_1499'),
      // paymentStatus: 'active',
      startDate: new Date(),
      expiryDate
    },
    { upsert: true, new: true }
  );

  res.status(200).json(new ApiResponse(200, null, 'Payment verified and subscription activated!'));
});
