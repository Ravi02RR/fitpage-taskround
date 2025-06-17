import type { Request, Response } from "express";
import { prismaClient } from "../../db/db";
import redisClient from "../config/redis";
import { productSchema } from "../Zod/Schema";

class ProductController {
  private static readonly ALL_PRODUCTS_CACHE_KEY = "allProducts";
  static async fetchAllProducts(req: Request, res: Response): Promise<void> {
    try {
      const cachedProducts = await redisClient.get(
        ProductController.ALL_PRODUCTS_CACHE_KEY
      );

      if (cachedProducts) {
        res.status(200).json(JSON.parse(cachedProducts));
        return;
      }

      const products = await prismaClient.product.findMany();

      await redisClient.set(
        ProductController.ALL_PRODUCTS_CACHE_KEY,
        JSON.stringify(products),
        "EX",
        3600
      );

      res.status(200).json(products);
    } catch (error) {
      console.error("[ProductController] Error fetching all products:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  static async fetchProductById(req: Request, res: Response): Promise<void> {
    try {
      const productId = req.query.productId as string;
      console.log(`[ProductController] Fetching product ID: ${productId}`);

      if (!productId) {
        res.status(400).json({ error: "Product ID is required." });
        return;
      }

      const product = await prismaClient.product.findUnique({
        where: { id: productId },
        include: {
          reviews: {
            include: {
              photos: true,
            },
          },
        },
      });

      if (!product) {
        res.status(404).json({ error: "Product not found." });
        return;
      }

      res.status(200).json(product);
    } catch (error) {
      console.error(
        `[ProductController] Error fetching product ID ${req.params.productId}:`,
        error
      );
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  static async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const validation = productSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({
          error: "Validation failed.",
          details: validation.error.flatten(),
        });
        return;
      }

      const { name, description, price } = validation.data;

      const newProduct = await prismaClient.product.create({
        data: { name, description, price },
      });

      await redisClient.del(ProductController.ALL_PRODUCTS_CACHE_KEY);

      res.status(201).json(newProduct);
    } catch (error) {
      console.error("[ProductController] Error creating product:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

export default ProductController;
