import express from "express";
import {isAdmin, protect} from "../middlewares/auth/protect.js";
import {
    createAnnouncement,
    deleteAnnouncement,
    getAnnouncementById,
    getAnnouncements, updateAnnouncement
} from "../controllers/announcement.controller.js";

const router = express.Router();

router.post('/', protect, isAdmin, createAnnouncement);
router.get('/', protect,getAnnouncements);
router.get('/:id', protect, getAnnouncementById);
router.delete('/:id', protect, isAdmin, deleteAnnouncement);
router.put('/:id', protect, isAdmin, updateAnnouncement);

export default router;