import type { Request, Response } from "express";
import { prismaClient } from "../../db/db";
import bcrypt from "bcryptjs";
import { userSchema } from "../Zod/Schema.ts";
import { formatZodError } from "../Zod/zodUtils.ts";
import jwt from "jsonwebtoken";

class UserAuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, fullName } = req.body;
      const parsedData = userSchema.safeParse({ email, password, fullName });

      if (!parsedData.success) {
        res.status(400).json({ errors: formatZodError(parsedData.error) });
        return;
      }

      const existingUser = await prismaClient.user.findUnique({
        where: { email: parsedData.data.email },
      });

      if (existingUser) {
        res.status(400).json({ error: "User already exists" });
        return;
      }

      const hashedPassword = await bcrypt.hash(parsedData.data.password, 10);

      const newUser = await prismaClient.user.create({
        data: {
          email: parsedData.data.email,
          password: hashedPassword,
          fullName: parsedData.data.fullName,
        },
      });

      res.status(201).json({
        message: "User registered successfully",
        user: {
          id: newUser.id,
          email: newUser.email,
          fullName: newUser.fullName,
        },
      });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const parsedData = userSchema
        .pick({ email, password })
        .safeParse(req.body);

      if (!parsedData.success) {
        res.status(400).json({ errors: formatZodError(parsedData.error) });
        return;
      }

      const user = await prismaClient.user.findUnique({
        where: { email: parsedData.data.email },
      });

      if (!user) {
        res.status(400).json({ error: "Invalid email or password" });
        return;
      }

      const isPasswordValid = await bcrypt.compare(
        parsedData.data.password,
        user.password
      );

      if (!isPasswordValid) {
        res.status(400).json({ error: "Invalid email or password" });
        return;
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
        },
        process.env.JWT_SECRET as string
      );

      res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
        },
      });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

export default UserAuthController;
