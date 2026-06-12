import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId;
  planType: string;
  startDate: Date;
  expiryDate: Date;
  paymentStatus: string;
}

const SubscriptionSchema = new Schema<ISubscription>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  planType: { type: String, enum: ['PRO_999', 'PRO_1499'], required: true },
  startDate: { type: Date, default: Date.now },
  expiryDate: { type: Date, required: true },
  paymentStatus: { type: String, enum: ['active', 'pending', 'expired'], default: 'pending' }
}, { timestamps: true });

export default mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
