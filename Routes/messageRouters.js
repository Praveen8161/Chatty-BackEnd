import express from "express";
import { checkUser } from "../middlewares/authMiddlewares.js";
import { allMessages, sendMessage } from "../controllers/messageControllers.js";

const router = express.Router();

// Send New Message // Routes - POST ' message/  '
router.post("/", checkUser, sendMessage);

// Get All the messsages for a Chat // Routes - GET ' message/:chatId  '
router.get("/:chatId", checkUser, allMessages);

export const messageRouters = router;
