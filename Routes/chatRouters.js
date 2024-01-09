import express from "express";
import { checkUser } from "../middlewares/authMiddlewares.js";
import {
  accessChat,
  addToGroup,
  createGroup,
  fetchChat,
  removeGroup,
  renameGroup,
} from "../controllers/chatControllers.js";

const router = express.Router();

// chat access - one on one // Routes - POST ' chat/  '
router.post("/", checkUser, accessChat);

// Fetch Chat - all chats //  Routes - GET ' chat/ '
router.get("/", checkUser, fetchChat);

// Create group - // Routes - POST - ' chat/group '
router.post("/group", checkUser, createGroup);

// Rename group - // Route - PUT - ' chat/rename '
router.put("/rename", checkUser, renameGroup);

// Add to group - // Route - PUT - ' chat/groupadd
router.put("/groupadd", checkUser, addToGroup);

// Remove group - // Route - PUT - ' chat/remove '
router.put("/remove", checkUser, removeGroup);

export const chatRouters = router;
