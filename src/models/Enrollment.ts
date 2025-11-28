import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEnrollment extends Document {
    studentId: mongoose.Types.ObjectId;
    courseId: mongoose.Types.ObjectId;
    enrolledAt: Date;
    progress: {
        completedModules: mongoose.Types.ObjectId[];
        completedLessons: mongoose.Types.ObjectId[];
        completionPercentage: number;
    };
}

const EnrollmentSchema: Schema = new Schema(
    {
        studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
        enrolledAt: { type: Date, default: Date.now },
        progress: {
            completedModules: [{ type: Schema.Types.ObjectId }],
            completedLessons: [{ type: Schema.Types.ObjectId }],
            completionPercentage: { type: Number, default: 0 },
        },
    },
    { timestamps: true }
);

EnrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

const Enrollment: Model<IEnrollment> =
    mongoose.models.Enrollment ||
    mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);

export default Enrollment;
