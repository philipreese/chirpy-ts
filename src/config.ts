import { MigrationConfig } from "drizzle-orm/migrator";

type Config = {
    api: APIConfig;
    db: DBConfig;
};

type APIConfig = {
    fileserverHits: number;
    port: number;
};

export type DBConfig = {
    url: string;
    migrationConfig: MigrationConfig;
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
    },
    db: {
        url: envOrThrow("DB_URL"),
        migrationConfig: migrationConfig,
    },
};
