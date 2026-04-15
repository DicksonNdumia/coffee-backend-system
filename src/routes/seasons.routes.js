import express from "express";
import { isDirector, protect } from "../middlewares/auth/protect.js";
import {
  closeSeason,
  createSeason,
  getAllSeasons,
  getSeasonByYear,
  updateSeasonPricing,
} from "../controllers/season.controller.js";

const router = express.Router();

router.post("/", protect, isDirector, createSeason);
router.get("/", protect, getAllSeasons);
router.get("/year/:year", protect, getSeasonByYear);
router.patch("/:year", protect, isDirector, updateSeasonPricing);
router.patch("/close/:year", protect, isDirector, closeSeason);

export default router;
