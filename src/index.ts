import express from "express";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";

import { handlerReadiness } from "./api/readiness.js";
import {
    middlewareLogResponses,
    middlewareBlockChromeDevTools,
    middlewareMetricsInc,
    middlewareErrorHandler,
} from "./api/middleware.js";
import { handlerMetrics } from "./api/metrics.js";
import { handlerReset } from "./api/reset.js";
import {
    handlerCreateChirp,
    handlerDeleteChirp,
    handlerGetChirpById,
    handlerGetChirps,
} from "./api/chirps.js";
import { config } from "./config.js";
import { handlerCreateUser, handlerUpdateUser } from "./api/users.js";
import { handlerLogin, handlerRefresh, handlerRevoke } from "./api/auth.js";
import { handlerWebhook } from "./api/webhooks.js";

const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);

const app = express();

app.use(middlewareBlockChromeDevTools);
app.use(middlewareLogResponses);
app.use(express.json());

app.use("/app", middlewareMetricsInc, express.static("./src/app"));

app.get("/api/healthz", (req, res, next) => {
    Promise.resolve(handlerReadiness(req, res)).catch(next);
});

app.post("/api/chirps", (req, res, next) => {
    Promise.resolve(handlerCreateChirp(req, res)).catch(next);
});
app.get("/api/chirps", (req, res, next) => {
    Promise.resolve(handlerGetChirps(req, res)).catch(next);
});
app.get("/api/chirps/:chirpID", (req, res, next) => {
    Promise.resolve(handlerGetChirpById(req, res)).catch(next);
});
app.delete("/api/chirps/:chirpID", (req, res, next) => {
    Promise.resolve(handlerDeleteChirp(req, res)).catch(next);
});

app.post("/api/users", (req, res, next) => {
    Promise.resolve(handlerCreateUser(req, res)).catch(next);
});
app.put("/api/users", (req, res, next) => {
    Promise.resolve(handlerUpdateUser(req, res)).catch(next);
});

app.post("/api/polka/webhooks", (req, res, next) => {
    Promise.resolve(handlerWebhook(req, res)).catch(next);
});

app.post("/api/login", (req, res, next) => {
    Promise.resolve(handlerLogin(req, res)).catch(next);
});

app.post("/api/refresh", (req, res, next) => {
    Promise.resolve(handlerRefresh(req, res)).catch(next);
});
app.post("/api/revoke", (req, res, next) => {
    Promise.resolve(handlerRevoke(req, res)).catch(next);
});

app.get("/admin/metrics", (req, res, next) => {
    Promise.resolve(handlerMetrics(req, res)).catch(next);
});
app.post("/admin/reset", (req, res, next) => {
    Promise.resolve(handlerReset(req, res)).catch(next);
});

app.use(middlewareErrorHandler);

app.listen(config.api.port, () => {
    console.log(`Server is running at http://localhost:${config.api.port}`);
});
