export interface Config {
    MONGO_ATLAS_USER: string;
    MONGO_ATLAS_PASS: string;
    MONGO_ATLAS_CLUSTER: string;
    MONGO_ATLAS_DB: string;
    MONGODB_URI: string;
    JWT_SECRETS: string;
    SENTRY_DSN: string;
    SENTRY_RELEASE: string;
}

export const config: Config = {
    MONGO_ATLAS_USER: process.env.MONGO_ATLAS_USER || '',
    MONGO_ATLAS_PASS: process.env.MONGO_ATLAS_PASS || '',
    MONGO_ATLAS_CLUSTER: process.env.MONGO_ATLAS_CLUSTER || '',
    MONGO_ATLAS_DB: process.env.MONGO_ATLAS_DB || '',
    MONGODB_URI: "",

    // JWT
    JWT_SECRETS: process.env.JWT_SECRETS || '',
    // Sentry
    SENTRY_DSN: process.env.SENTRY_DSN || '',
    SENTRY_RELEASE: process.env.SENTRY_RELEASE || '',

};

config.MONGODB_URI = `mongodb+srv://${config.MONGO_ATLAS_USER}:${config.MONGO_ATLAS_PASS}@${config.MONGO_ATLAS_CLUSTER}/${config.MONGO_ATLAS_DB}?retryWrites=true&w=majority`;
