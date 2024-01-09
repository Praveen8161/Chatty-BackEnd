import express from "express";
import {
  getAllUsers,
  loginUser,
  registerUser,
} from "../controllers/userControllers.js";
import { checkUser } from "../middlewares/authMiddlewares.js";

const router = express.Router();

// Register Users // Route - POST - ' /user/register '
router.post("/register", registerUser);

// Login Users // Route - POST - ' /user/login '
router.post("/login", loginUser);

// All users - search // Route - GET - ' /user?search=praveen '
router.get("/", checkUser, getAllUsers);

export const userRouters = router;
