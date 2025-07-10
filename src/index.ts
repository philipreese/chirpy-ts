import express from "express";
import { handlerReadiness } from "./api/handlerReadiness.js";
import { middlewareLogResponses, middlewareBlockChromeDevTools, middlewareMetricsInc } from "./api/middleware.js";
import { handlerMetrics } from "./api/handlerMetrics.js";
import { handlerReset } from "./api/handlerReset.js";

const app = express();
const PORT = 8080;

app.use(middlewareBlockChromeDevTools);
app.use(middlewareLogResponses);

app.use("/app", middlewareMetricsInc, express.static("./src/app"));

app.get("/healthz", handlerReadiness);
app.get("/metrics", handlerMetrics);
app.get("/reset", handlerReset);

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});