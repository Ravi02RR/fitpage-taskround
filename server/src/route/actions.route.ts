import express from "express";
import ActionsController from "../controller/actions.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const actionsRoute = express.Router();

actionsRoute.post(
  "/product/:productId/review",
  //@ts-ignore
  authMiddleware,
  ActionsController.postReview
);

actionsRoute.get(
  "/product/review-summary",
  //@ts-ignore
  ActionsController.streamReviewSummary
);
export default actionsRoute;
