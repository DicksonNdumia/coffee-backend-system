//Packages Import
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import pool from "./config/db.config.js";
import chalk from "chalk";
import { myLogger } from "./middlewares/log/isLogged.js";

//Routes imports
import AuthRoutes from "./routes/authRoutes.js";
import UserRoutes from "./routes/userRoutes.js";
import FarmersProfile from "./routes/farmersProfile.routes.js";
import SeasonsRoutes from "./routes/seasons.routes.js";
import DeliveryRoutes from "./routes/delivery.routes.js";
import FarmersData from "./routes/farmersData.routes.js";
import FactoryData from "./routes/factoryData.routes.js";
import AnnouncementRoutes from "./routes/announcement.routes.js";
import MeetingsRoutes from "./routes/meeting.routes.js";
import MinutesRoutes from "./routes/minutes.routes.js";
import AnalysisRoutes from "./routes/analysis.routes.js";

//dotenv initialization
dotenv.config();

//app initialization
const app = express();

//Middlewares
app.use(express.json());
app.use(cors());
app.use(myLogger);

//Routes usage
app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/users", UserRoutes);
app.use("/api/v1/farmers", FarmersProfile);
app.use("/api/v1/season", SeasonsRoutes);
app.use("/api/v1/deliveries", DeliveryRoutes);
app.use("/api/v1/delivered", FarmersData);
app.use("/api/v1/landing", FactoryData);
app.use("/api/v1/announcements", AnnouncementRoutes);
app.use("/api/v1/meetings", MeetingsRoutes);
app.use("/api/v1/minutes", MinutesRoutes);
app.use('/api/v1/analysis/admin', AnalysisRoutes);

//Port Declaring
const PORT = process.env.PORT || 3000;

//Tests
app.get("/", (req, res) => {
  res.json({
    message: "Hello From a container",
    service: "Hello-node",
    pod: process.env.POD_NAME || "unknown",
    time: new Date().toISOString(),
  });
});

app.get("/ready", (req, res) => res.status(200).send("ready"));
app.get("/healthy", (req, res) => res.status(200).send("ok"));

//Database testing connection
pool
  .connect()
  .then(() => console.log(chalk.yellow("Db Connected")))
  .catch((err) => console.error(chalk.red("connection error", err)));

//Port Listening
app.listen(PORT, () => {
  console.log(`Port is running on port ${PORT}`);
});
