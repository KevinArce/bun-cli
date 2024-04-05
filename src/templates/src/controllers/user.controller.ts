import { Context } from "elysia";
import { UserModel } from "../models/user.schema";
import * as Sentry from "@sentry/bun";
import { hashPassword } from "../utils/hashPassword";
import jwt from "jsonwebtoken";
import logger from "../utils/logger";
import { config } from "../config";

interface RegisterUserRequest {
    username: string;
    email: string;
    password: string;
    fullName?: string;
    bio?: string;
    profilePicture?: string;
}

interface LoginUserRequest {
    email: string;
    password: string;
}

async function emailExists(email: string): Promise<boolean> {
    try {
        const existingUser = await UserModel.findOne({ email }).lean();
        return Boolean(existingUser);
    } catch (error: any) {
        Sentry.captureException(error);
        throw new Error("Error checking if email exists");
    }
}

async function usernameExists(username: string): Promise<boolean> {
    try {
        const existingUser = await UserModel.findOne({ username }).lean();
        return Boolean(existingUser);
    } catch (error: any) {
        Sentry.captureException(error);
        throw new Error("Error checking if username exists");
    }
}

// Function to verify a password against the hashed password in the database
async function verifyPassword(
    email: string,
    password: string
): Promise<boolean> {
    try {
        const user = await UserModel.findOne({ email }).lean();
        if (!user) {
            return false;
        }

        return await Bun.password.verify(password, user.password);
    } catch (error: any) {
        Sentry.captureException(error);
        throw new Error("Error verifying password");
    }
}

export const registerUser = async (ctx: Context) => {
    try {
        const requestBody = (await ctx.request.json()) as RegisterUserRequest;

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(requestBody.email)) {
            throw new Error("Invalid email format");
        }

        // Validate password length
        if (requestBody.password.length < 7) {
            throw new Error("Password must be at least 7 characters long");
        }

        // Check if the email already exists
        if (await emailExists(requestBody.email)) {
            console.log("Email already in use");
            throw new Error("Email already in use");
        }

        // Check if the username already exists
        if (await usernameExists(requestBody.username)) {
            console.log("Username already in use");
            throw new Error("Username already in use");
        }

        // Hash the password
        const hashedPassword = await hashPassword(requestBody.password);

        // Create a new user
        logger.info("Creating new user"); // Use logger instead of console.log
        const newUser = new UserModel({
            ...requestBody,
            roles: ["user"],
            password: hashedPassword,
        });

        // Save the new user
        try {
            const savedUser = await newUser.save();
            logger.info(`User saved successfully: ${savedUser}`); // Use logger for success message
        } catch (saveError) {
            logger.error(`Error saving user: ${saveError}`); // Use logger for error message
            throw saveError;
        }

        return { message: "User registered successfully", userId: newUser._id };
    } catch (error: any) {
        Sentry.captureException(error);
        logger.error(`Registration failed: ${error}`); // Use logger for error message
        throw new Error("Registration failed");
    }
};

export const loginUser = async (ctx: Context) => {
    try {
        const requestBody = (await ctx.request.json()) as LoginUserRequest;
        const { email, password } = requestBody;

        if (!email || !password) {
            return {
                status: 400,
                body: { message: "Missing required fields for login" },
            };
        }

        // Verify if email and password are correct
        const isPasswordValid = await verifyPassword(email, password);
        if (!isPasswordValid) {
            return { status: 401, body: { message: "Invalid user or password" } };
        }

        // Generate JWT token using the context's jwt method
        const token = jwt.sign({ email }, config.JWT_SECRETS, { expiresIn: "1h" });
        logger.info(`JWT token generated: ${token}`); // Use logger for success message

        logger.info("Login successful"); // Use logger for success message
        return { status: 200, body: { message: "Login successful", token } };
    } catch (error: any) {
        Sentry.captureException(error);
        logger.error(`Login failed: ${error.message}`); // Use logger for error message
        return {
            status: 500,
            body: { message: "Login failed", error: error.message },
        };
    }
};
