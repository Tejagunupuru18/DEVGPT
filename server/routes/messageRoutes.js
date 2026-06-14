import express from "express";
import { protect } from "../middlewares/auth.js";
import {
  imageMessageController,
  textMessageController,
} from "../controllers/messageController.js";

const messageRouter = expressRouter();
messageRouter.post("/text", protect, textMessageController);
messageRouter.post("/text", protect, imageMessageController);

export default messageRouter;
