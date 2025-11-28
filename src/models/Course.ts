import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILesson {
    _id?: mongoose.Types.ObjectId;
    title: string;
    content: string; // Markdown
    order: number;
    referenceLinks: string[];
    videoUrl?: string;
    quizQuestions?: {
        question: string;
        options: string[];
        correctAnswerIndex: number;
    }[];
}

export interface IModule {
    _id?: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    order: number;
    lessons: ILesson[];
}

export interface ICourse extends Document {
    title: string;
    topic: string;
    description: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    tone: string;
    totalDuration: string; // e.g. "10 hours"
    educatorId: mongoose.Types.ObjectId;
    modules: IModule[];
    isPublished: boolean;
    tags: string[];
    thumbnailUrl?: string;
    aiGenerated: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const LessonSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, default: '' },
    order: { type: Number, required: true },
    referenceLinks: [{ type: String }],
    videoUrl: { type: String },
    quizQuestions: [
        {
            question: String,
            options: [String],
            correctAnswerIndex: Number,
        },
    ],
});

const ModuleSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    order: { type: Number, required: true },
    lessons: [LessonSchema],
});

const CourseSchema: Schema = new Schema(
    {
        title: { type: String, required: true },
        topic: { type: String, required: true },
        description: { type: String, required: true },
        level: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced'],
            required: true,
        },
        tone: { type: String, default: 'professional' },
        totalDuration: { type: String, required: true },
        educatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        modules: [ModuleSchema],
        isPublished: { type: Boolean, default: false },
        tags: [{ type: String }],
        thumbnailUrl: { type: String },
        aiGenerated: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Indexes
CourseSchema.index({ title: 'text', topic: 'text', description: 'text' });
CourseSchema.index({ educatorId: 1 });

const Course: Model<ICourse> =
    mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);

export default Course;
