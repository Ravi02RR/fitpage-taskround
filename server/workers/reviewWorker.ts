import { Worker } from "bullmq";
import redisClient from "../src/config/redis";
import cloudinary from "../src/config/cloudinary";
import { prismaClient } from "../db/db";

const reviewWorker = new Worker(
  "review-post-queue",
  async (job) => {
    const { userId, productId, rating, comment, photoPaths } = job.data;

    const newReview = await prismaClient.review.create({
      data: {
        userId,
        productId,
        rating: rating ?? undefined,
        comment: comment ?? undefined,
      },
    });

    if (photoPaths && photoPaths.length > 0) {
      const uploadedPhotos = await Promise.all(
        photoPaths.map(async (path: string) => {
          const uploadResult = await cloudinary.uploader.upload(path, {
            folder: "reviews",
          });
          return {
            reviewId: newReview.id,
            url: uploadResult.secure_url,
          };
        })
      );

      await prismaClient.reviewPhoto.createMany({
        data: uploadedPhotos,
      });
    }

    console.log(
      `[Worker] Created review ${newReview.id} with ${photoPaths.length} photos`
    );
  },
  { connection: redisClient }
);

reviewWorker.on("ready", () => {
  console.log("[Worker] Review post worker is ready");
});

reviewWorker.on("completed", (job) => {
  console.log(`[Worker] Job ${job.id} completed`);
});

reviewWorker.on("failed", (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed:`, err);
});

export default reviewWorker;
