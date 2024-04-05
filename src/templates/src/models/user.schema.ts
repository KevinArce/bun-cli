import mongoose, { Document, Schema } from 'mongoose';

interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    fullName?: string;
    bio?: string;
    profilePicture?: string;
    createdAt: Date;
    updatedAt: Date;
    roles?: string[];
    isActive?: boolean;
    socialProfiles?: { platform: string; profileUrl: string }[];
    address?: {
        street: string;
        city: string;
        state: string;
        country: string;
        zipCode: string;
    };
}

const userSchema = new Schema<IUser>(
    {
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        fullName: { type: String },
        bio: { type: String },
        profilePicture: { type: String },
        createdAt: { type: Date, default: Date.now, required: true },
        updatedAt: { type: Date, default: Date.now, required: true },
        roles: { type: [String], default: [] },
        isActive: { type: Boolean, default: true },
        socialProfiles: [
            {
                platform: { type: String },
                profileUrl: { type: String },
            },
        ],
        address: {
            street: { type: String },
            city: { type: String },
            state: { type: String },
            country: { type: String },
            zipCode: { type: String },
        },
    },
);

export const UserModel = mongoose.model<IUser>('User', userSchema);
