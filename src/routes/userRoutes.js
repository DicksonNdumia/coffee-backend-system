import express from "express";
import { isAdmin, protect } from "../middlewares/auth/protect.js";
import {
  addUser,
  deleteUsers,
  getAllUsers,
  getUserById,
} from "../controllers/users.controller.js";

const router = express.Router();

router.get("/", protect, isAdmin, getAllUsers);
router.delete("/:id", protect, isAdmin, deleteUsers);
router.get("/:id", protect, isAdmin, getUserById);
router.post("/admin", protect, isAdmin, addUser);

export default router;
