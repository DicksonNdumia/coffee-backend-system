import express from "express";
import {isAdmin, protect} from "../middlewares/auth/protect.js";
import {
    createMeeting,
    deleteMeeting,
    getMeeting,
    getMeetingById,
    updateMeeting
} from "../controllers/meeting.controller.js";


const router = express.Router();

router.post('/',protect,isAdmin,createMeeting);
router.get('/',protect,getMeeting);
router.get('/:id',protect,getMeetingById);
router.delete('/:id',protect,isAdmin,deleteMeeting);
router.put('/:id',protect,isAdmin,updateMeeting);



export default router;