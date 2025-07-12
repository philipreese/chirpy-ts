import { defineConfig } from "drizzle-kit";
import { apiConfig } from "./src/config.js";

export default defineConfig({
    schema: "src/db/schema.ts",
    out: "src/db/migrations",
    dialect: "postgresql",
    dbCredentials: {
        url: apiConfig.dbURL,
    },
});
