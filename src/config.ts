type APIConfig = {
    fileserverHits: number;
    dbURL: string;
};

process.loadEnvFile();

function envOrThrow(key: string) {
    if (!process.env[key]) {
        throw new Error(`Environment variable ${key} is not set`);
    }
    return process.env[key];
}

export const apiConfig: APIConfig = {
    fileserverHits: 0,
    dbURL: envOrThrow("DB_URL"),
};
