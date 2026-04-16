import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import pool from "./config/db.config.js";
import chalk from "chalk";
import { myLogger } from "./middlewares/log/isLogged.js";
import AuthRoutes from "./routes/authRoutes.js";
import UserRoutes from "./routes/userRoutes.js";
import FarmersProfile from "./routes/farmersProfile.routes.js";
import SeasonsRoutes from "./routes/seasons.routes.js";
import  DeliveryRoutes from "./routes/delivery.routes.js";
import FarmersData from "./routes/farmersData.routes.js";
import FactoryData from './routes/factoryData.routes.js'

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(myLogger);

app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/users", UserRoutes);
app.use("/api/v1/farmers", FarmersProfile);
app.use("/api/v1/season", SeasonsRoutes);
app.use("/api/v1/deliveries", DeliveryRoutes);
app.use('/api/v1/delivered',FarmersData);
app.use('/api/v1/landing',FactoryData);


const PORT = process.env.PORT || 3000;

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

pool
  .connect()
  .then(() => console.log(chalk.yellow("Db Connected")))
  .catch((err) => console.error(chalk.red("connection error", err)));

app.listen(PORT, () => {
  console.log(`Port is running on port ${PORT}`);
});
