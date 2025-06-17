import express from "express";
import ProductController from "../controller/product.controller";

const productRoute = express.Router();

productRoute.get("/", ProductController.fetchAllProducts);
productRoute.get("/get-product", ProductController.fetchProductById);
productRoute.post("/", ProductController.createProduct);

export default productRoute;
