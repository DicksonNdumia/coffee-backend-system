import express from "express";
import {isAdmin, protect} from "../middlewares/auth/protect.js";
import {
    createAnnouncement,
    deleteAnnouncement,
    getAnnouncementById,
    getAnnouncements, updateAnnouncement
} from "../controllers/announcement.controller.js";
import upload from "../helper/uploads/upload.js";

const router = express.Router();

router.post('/', protect, isAdmin,upload.single("image"), createAnnouncement);
router.get('/', getAnnouncements);
router.get('/:id', protect, getAnnouncementById);
router.delete('/:id', protect, isAdmin, deleteAnnouncement);
router.put('/:id', protect, isAdmin,upload.single("image"), updateAnnouncement);

export default router;