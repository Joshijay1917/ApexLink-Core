import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  transactionId: string;
  utr?: string;
  amount: number;
  currency: string;
  status: string;
  screenshotUrl?: string;
}

const TransactionSchema = new Schema<ITransaction>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  transactionId: { type: String, required: true, unique: true },
  utr: { type: String, default: null },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  screenshotUrl: { type: String }
}, { timestamps: true });

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);
