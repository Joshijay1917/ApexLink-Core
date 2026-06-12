import mongoose, { Schema, Document } from 'mongoose';

export interface IChat extends Document {
  chatId: string;
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  timestamp: Date;
}

const ChatSchema = new Schema<IChat>({
  chatId: { type: String, required: true, unique: true, index: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model<IChat>('Chat', ChatSchema);
