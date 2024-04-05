import mongoose, { Document, Schema } from 'mongoose';

interface IThread extends Document {
    threadId: string;
    userStudent: string;
    platform: string;
    threadType: string;
    runId: string[];
    createdAt: Date;
    updatedAt: Date;
}

const threadSchema = new Schema<IThread>(
    {
        threadId: { type: String, required: true },
        userStudent: { type: String, required: true },
        platform: { type: String, required: false },
        threadType: { type: String, required: false },
        runId: [{ type: String }],
        createdAt: { type: Date, default: Date.now, required: true },
        updatedAt: { type: Date, default: Date.now, required: true },
    },
);

export const ThreadModel = mongoose.model<IThread>('Thread', threadSchema);
