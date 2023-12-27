import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import helmet from "helmet";
import fileUpload from "express-fileupload";
import { API_PORT, FRONTEND_URL, APPLICATION_NAME, AUTH0_DOMAIN, METABASE_URL } from "./config";
import { doHealthCheck } from "./utils/health-check";
import { userRouter, permissionRouter, visitorCentreRouter, loaderRouter, kioskDataRouter } from "./routes";
import { CreateMigrationRoutes } from "./data";
import { Scheduler } from "./utils/scheduler";

//import { configureLocalAuthentication } from "./routes/auth-local";
//runMigrations();

const app = express();
app.use(express.json({ limit: "25mb" })); // for parsing application/json
app.use(express.urlencoded({ extended: true, limit: "25mb" })); // for parsing application/x-www-form-urlencoded
app.use(fileUpload());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "default-src": ["'self'", `${AUTH0_DOMAIN}`, `${METABASE_URL}`],
      "base-uri": ["'self'"],
      "block-all-mixed-content": [],
      "font-src": ["'self'", "https:", "data:"],
      "frame-ancestors": ["'self'"],
      "img-src": ["'self'", "data:"],
      "object-src": ["'none'"],
      "script-src": ["'self'", "'unsafe-eval'"],
      "script-src-attr": ["'none'"],
      "style-src": ["'self'", "https:", "'unsafe-inline'"],
    },
  })
);

// very basic CORS setup
app.use(
  cors({
    origin: FRONTEND_URL,
    optionsSuccessStatus: 200,
    credentials: true,
  })
);

CreateMigrationRoutes(app);

const scheduler = new Scheduler();

app.get("/api/healthCheck", (req: Request, res: Response) => {
  // app.get("/api/healthCheck",  (req: Request, res: Response) => {
  doHealthCheck(req, res);
});

app.use("/api/visitor-centre", visitorCentreRouter);
app.use("/api/user", userRouter);
app.use("/api/permission", permissionRouter);
app.use("/api/loader", loaderRouter);
app.use("/api/kiosk", kioskDataRouter);

// serves the static files generated by the front-end
app.use(express.static(path.join(__dirname, "web")));

// if no other routes match, just send the front-end
app.use((req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "web") + "/index.html");
});

const PORT: number = parseInt(API_PORT as string);

app.listen(PORT, async () => {
  console.log(`${APPLICATION_NAME} API listenting on port ${PORT}`);
});
