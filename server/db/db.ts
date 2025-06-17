import { PrismaClient } from "../generated/prisma";

export const prismaClient = new PrismaClient({
  log: ["query", "info", "warn", "error"],
  errorFormat: "pretty",
});
