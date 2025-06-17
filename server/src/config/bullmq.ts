import { Queue } from "bullmq";
import redisClient from "./redis";
export const reviewQueue = new Queue("review-post-queue", {
  connection: redisClient,
});
