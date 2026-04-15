import express from "express";
import { isDirector, protect } from "../middlewares/auth/protect.js";
import {
    closeDeliverySession,
    createDeliverySession, deleteDeliverySession,
    getDeliverySession
} from "../controllers/deliverySessions.controller.js";

const router = express.Router();

router.post('/:season_id',protect,isDirector,createDeliverySession);
router.get('/',getDeliverySession);
router.patch('/:id',protect,isDirector,closeDeliverySession);
router.delete('/:id',protect,isDirector,deleteDeliverySession);



export default router;