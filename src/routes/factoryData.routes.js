import express from "express";
import {isAdmin, protect} from "../middlewares/auth/protect.js";
import {factoryData, getFactoryData, getFactoryDataById, updateFactoryData} from "../controllers/factory.controller.js";

const router = express.Router();

router.post('/', protect,isAdmin,factoryData);
router.get('/',getFactoryData);
router.get('/:id',protect,isAdmin,getFactoryDataById);
router.put('/:id',protect,isAdmin,updateFactoryData);


export default router;