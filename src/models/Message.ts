import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  chatId: string;
  senderId: mongoose.Types.ObjectId;
  senderName: string;
  originalMsg: string;
  translations?: Record<string, string>;
  translatedMsg?: string;
  originalLang: string;
  translatedLang: string;
  messageType: 'text' | 'image' | 'video' | 'document';
  isRead: boolean;
  timestamp: Date;
}

const MessageSchema = new Schema<IMessage>({
  chatId: { type: String, required: true, ref: 'Chat' },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  senderName: { type: String, required: true },
  originalMsg: { type: String, required: true },
  translations: { type: Map, of: String },
  translatedMsg: { type: String },
  originalLang: { type: String, required: true },
  translatedLang: { type: String, required: true },
  messageType: { type: String, enum: ['text', 'image', 'video', 'document'], default: 'text' },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model<IMessage>('Message', MessageSchema);
