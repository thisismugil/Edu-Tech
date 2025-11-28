import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IChatMessage extends Document {
    senderId: mongoose.Types.ObjectId;
    receiverId?: mongoose.Types.ObjectId;
    courseId?: mongoose.Types.ObjectId;
    message: string;
    isRead: boolean;
    createdAt: Date;
}

const ChatMessageSchema: Schema = new Schema(
    {
        senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        receiverId: { type: Schema.Types.ObjectId, ref: 'User' },
        courseId: { type: Schema.Types.ObjectId, ref: 'Course' }, // Optional context
        message: { type: String, required: true },
        isRead: { type: Boolean, default: false },
    },
    { timestamps: true }
);

ChatMessageSchema.index({ senderId: 1, receiverId: 1 });
ChatMessageSchema.index({ receiverId: 1, isRead: 1 });

const ChatMessage: Model<IChatMessage> =
    mongoose.models.ChatMessage ||
    mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);

export default ChatMessage;
