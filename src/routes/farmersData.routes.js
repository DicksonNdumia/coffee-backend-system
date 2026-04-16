import express from "express";
import {isDirector, isFarmer,isAdmin, protect} from "../middlewares/auth/protect.js";
import {
    getFarmerPayout,
    getFarmersData,
    recordFarmersData,
    updateFarmerData
} from "../controllers/farmersData.controller.js";


const router = express.Router();

router.post('/:farmer_no',protect,isDirector,recordFarmersData);
router.get('/:farmer_no',protect,isFarmer,getFarmersData);
router.get('/pay/:farmer_no',protect,isFarmer,getFarmerPayout);
router.put('/:id',protect,isAdmin,updateFarmerData);


export default router;