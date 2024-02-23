import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import session from "express-session";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// app.use(ejsLint());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(
  session({
    secret: "rkoranne",
    resave: false,
    saveUninitialized: false,
  })
);

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// routes import
import dogParentRouter from "./routes/dogParent.routes.js";
import indexRouter from "./routes/index.routes.js";
import dogVeterinaryRouter from "./routes/dogVeterinary.routes.js";
import petStoreRoutes from "./routes/petStore.routes.js"
import dogTrainerRoutes from "./routes/trainer.routes.js"

// routes declaration
app.use("/dogParent", dogParentRouter);
app.use("/dogVeterinary", dogVeterinaryRouter);
app.use("/petStore", petStoreRoutes);
app.use("/dogTrainer", dogTrainerRoutes);
app.use("/", indexRouter);

export { app };
