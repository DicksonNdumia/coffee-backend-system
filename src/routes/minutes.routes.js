import express from "express";
import {DirectorOrAdmin, isAdmin, isDirector, protect} from "../middlewares/auth/protect.js";

import {
    addMinutes,
    deleteMinuteById,
    getMinuteById,
    getMinutes,
    updateMinuteById
} from "../controllers/minutes.controller.js";


const router = express.Router();

router.post("/:meeting_id", protect, isDirector, addMinutes);
router.get('/',protect,getMinutes);
router.get('/:id',protect,DirectorOrAdmin,getMinuteById);
router.delete('/:id',protect,DirectorOrAdmin,deleteMinuteById);
router.put('/:id',protect,DirectorOrAdmin,updateMinuteById);
export default router;
