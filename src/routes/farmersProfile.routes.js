import express from "express";
import { isDirector, protect } from "../middlewares/auth/protect.js";
import {
  createFarmerProfile,
  deleteFarmerProfile,
  getFarmersProfiles,
  getFarmersProfilesById,
} from "../controllers/farmersProfile.controller.js";

const router = express.Router();

router.post("/", protect, isDirector, createFarmerProfile);
router.get("/", protect, isDirector, getFarmersProfiles);
router.get("/:farmer_no", protect, isDirector, getFarmersProfilesById);
router.delete("/:farmer_no", protect, isDirector, deleteFarmerProfile);

export default router;
