 "use strict";
import { Router } from "express";
import { auth } from "../../middleware/auth.js";
import * as OC from "./order.controler.js";
import { systemroles } from "../../utils/systemroles.js";

const router = Router();

router.post("/", auth([systemroles.user]), OC.createOrder);
router.put("/:id", auth([systemroles.user]), OC.CancelOrder);
router.get("/AllOrder", auth([systemroles.user,systemroles.admin,systemroles.superadmin]), OC.getOrders);
router.get("/Order/:id", auth([systemroles.user]), OC.getOrderById);
router.get("/status/:id", auth([systemroles.user]), OC.getStatusOrder);

export default router;
