import express from "express";
import {isAdmin, protect} from "../middlewares/auth/protect.js";

import {
    getDashboardStats

} from "../controllers/analysis.controller.js";
import {getAllFarmersPayout} from "../controllers/farmersData.controller.js";


const router = express.Router();

router.get('/',protect,isAdmin,getDashboardStats);
router.get('/payout/:season_id',protect,isAdmin,getAllFarmersPayout)


export default router