import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  preferredLang: string;
  subscriptionStatus: string;
  trialStartDate: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  preferredLang: { type: String, default: 'en' },
  subscriptionStatus: { type: String, default: 'free_tier' },
  trialStartDate: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
