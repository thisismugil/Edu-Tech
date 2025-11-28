import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEducatorProfile extends Document {
    userId: mongoose.Types.ObjectId;
    experienceYears: number;
    institution: string;
    qualification: string;
    bio?: string;
    profileImageUrl?: string;
    verified: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const EducatorProfileSchema: Schema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        experienceYears: { type: Number, required: true },
        institution: { type: String, required: true },
        qualification: { type: String, required: true },
        bio: { type: String },
        profileImageUrl: { type: String },
        verified: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const EducatorProfile: Model<IEducatorProfile> =
    mongoose.models.EducatorProfile ||
    mongoose.model<IEducatorProfile>('EducatorProfile', EducatorProfileSchema);

export default EducatorProfile;
