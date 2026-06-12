import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IDoc extends MongooseDocument {
  chatId: mongoose.Types.ObjectId;
  name: string;
  url: string;
  timestamp: Date;
}

const DocumentSchema = new Schema<IDoc>({
  chatId: { type: Schema.Types.ObjectId, ref: 'Chat', required: true },
  name: { type: String, required: true },
  url: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model<IDoc>('Document', DocumentSchema);
