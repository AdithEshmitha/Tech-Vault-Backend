import express from 'express';
import { createProduct, deleteProduct, getProduct, getProductInfo, searchProducts, updateProduct } from '../Controllers/productController.js';

const productRouter = express.Router();

productRouter.post("/", createProduct);
productRouter.get("/", getProduct);
productRouter.get("/:productId", getProductInfo);
productRouter.delete("/:productId", deleteProduct);
productRouter.put("/:productId", updateProduct);
productRouter.get("/search/:query", searchProducts);

export default productRouter;