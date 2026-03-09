import { Router } from "express";
import { protectRoute } from "../middlewares/auth";
import { getChats, getCreateChat } from "../controllers/chatController";

const router = Router()

router.get("/" , protectRoute, getChats)
router.post("/with/:participantId" , protectRoute, getCreateChat)

export default router