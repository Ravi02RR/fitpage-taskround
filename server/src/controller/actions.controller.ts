import type { Request, Response } from "express";
import { prismaClient } from "../../db/db";
import type { requestWithUser } from "../middleware/auth.middleware";
import { reviewQueue } from "../config/bullmq";
import { summarizeReviews } from "../config/gemnai";

declare global {
  namespace Express {
    interface Request {
      user?: requestWithUser["user"];
    }
  }
}

class ActionsController {
  static async postReview(req: Request, res: Response) {
    try {
      const user = req.user as requestWithUser["user"];
      const { productId } = req.params;
      const { rating, comment } = req.body;

      if (!user) return res.status(401).json({ error: "Unauthorized" });
      if (!productId)
        return res.status(400).json({ error: "Product ID is required" });

      const existingReview = await prismaClient.review.findUnique({
        where: {
          userId_productId: {
            userId: user.id,
            productId,
          },
        },
      });

      if (existingReview) {
        return res
          .status(400)
          .json({ error: "You have already reviewed this product." });
      }

      const files = req.files?.photos;
      const filesArray = files ? (Array.isArray(files) ? files : [files]) : [];

      const filePaths = filesArray.map((file: any) => file.tempFilePath);

      await reviewQueue.add("create-review", {
        userId: user.id,
        productId,
        rating: rating ? parseInt(rating) : null,
        comment: comment ?? null,
        photoPaths: filePaths,
      });

      return res.status(202).json({ message: "Review added" });
    } catch (error) {
      console.error("[ActionsController] postReview error:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  static async streamReviewSummary(req: Request, res: Response) {
    try {
      const { productId } = req.query;

      if (!productId || typeof productId !== "string") {
        return res
          .status(400)
          .json({ error: "Missing or invalid productId in query." });
      }

      const reviews = await prismaClient.review.findMany({
        where: { productId },
        select: { rating: true, comment: true },
      });

      if (reviews.length === 0) {
        return res
          .status(404)
          .json({ error: "No reviews found for this product." });
      }

      const reviewText = reviews
        .map((r) => `Rating: ${r.rating}, Comment: ${r.comment}`)
        .join("\n");

      const headers = {
        "Content-Type": "text/event-stream",
        Connection: "keep-alive",
        "Cache-Control": "no-cache",
      };
      res.writeHead(200, headers);

      for await (const chunk of summarizeReviews(reviewText)) {
        const text = chunk?.text || "";
        if (text.trim()) {
          res.write(`data: ${text}\n\n`);
        }
      }

      res.write("event: done\ndata: Summary complete.\n\n");
      res.end();
    } catch (error) {
      console.error("[ActionsController] streamReviewSummary error:", error);
      res.write("event: error\ndata: Internal Server Error\n\n");
      res.end();
    }
  }
}

export default ActionsController;
