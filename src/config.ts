import { MigrationConfig } from "drizzle-orm/migrator";

type Config = {
    api: APIConfig;
    db: DBConfig;
    jwt: JWTConfig;
};

type APIConfig = {
    fileserverHits: number;
    port: number;
    platform: string;
};

type DBConfig = {
    url: string;
    migrationConfig: MigrationConfig;
};

type JWTConfig = {
    defaultDuration: number;
    refreshDuration: number;
    secret: string;
    issuer: string;
};

process.loadEnvFile();

function envOrThrow(key: string) {
    if (!process.env[key]) {
        throw new Error(`Environment variable ${key} is not set`);
    }
    return process.env[key];
}

const migrationConfig: MigrationConfig = {
    migrationsFolder: "./src/db/migrations",
};

export const config: Config = {
    api: {
        fileserverHits: 0,
        port: Number(envOrThrow("PORT")),
        platform: envOrThrow("PLATFORM"),
    },
    db: {
        url: envOrThrow("DB_URL"),
        migrationConfig: migrationConfig,
    },
    jwt: {
        defaultDuration: 60 * 60, // 1 hr in sec
        refreshDuration: 60 * 60 * 24 * 60 * 1000, // 60 days in ms
        secret: envOrThrow("JWT_SECRET"),
        issuer: "chirpy",
    },
};
