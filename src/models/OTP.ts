import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOTP extends Document {
    email: string;
    otp: string;
    createdAt: Date;
}

const OTPSchema: Schema = new Schema(
    {
        email: { type: String, required: true },
        otp: { type: String, required: true },
        createdAt: { type: Date, default: Date.now, expires: 60 }, // Expires in 60 seconds
    }
);

// Prevent recompilation of model in development
const OTP: Model<IOTP> =
    mongoose.models.OTP || mongoose.model<IOTP>('OTP', OTPSchema);

export default OTP;
