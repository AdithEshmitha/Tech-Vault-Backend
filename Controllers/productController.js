import Products from "../Models/productModel.js";
import { isAdminCheck } from "./userController.js";

// Product Create
export async function createProduct(req, res) {

    if (!isAdminCheck(req)) {
        return res.status(403).json({ massage: "Access Denied... Admins Only..." });
    }

    const product = new Products(req.body);

    try {
        const response = await product.save();
        res.json({
            message: "Product created successfully...",
            product: response
        });
        console.log(req)
    } catch (err) {
        res.status(500).json({ message: "Product creation failed", error: err.message });
        console.log(err);
    }
}


// Product Get
export async function getProduct(req, res) {
    try {
        if (isAdminCheck(req)) {
            const products = await Products.find();
            res.json(products);
        } else {
            const products = await Products.find({ isAvailable: true });
            res.json(products);
        }
    } catch (err) {
        console.log("Error : " + err);
        res.status(500).json({ message: "Failed to fetch products..." });
    }
}


// Delete Product
export async function deleteProduct(req, res) {

    if (!isAdminCheck(req)) {
        return res.status(403).json({ massage: "Access Denied... Admins Only..." });
    }

    try {

        const productId = req.params.productId;

        await Products.deleteOne(
            {
                productId: productId
            }
        );

        res.json({ massage: "Product deleted successfully" })

    } catch {

        (err) => {
            console.log(err);
            res.status(500).json({ massage: "Failed to delete product" });
        }

    }

}

// Update Product
export async function updateProduct(req, res) {

    if (!isAdminCheck(req)) {
        return res.status(403).json({ massage: "Access Denied... Admins Only..." });
    }

    const data = req.body;
    const productId = req.params.productId;
    data.productId = productId;

    try {

        await Products.updateOne(
            {
                productId: productId
            },
            data
        );

        res.json({ massage: "Product updated successfully" })

    } catch {
        (err) => {
            console.log(err);
            res.status(500).json({ massage: "Failed to update product" });
            return;
        }
    }

}

export async function getProductInfo(req, res) {

    try {
        const productId = req.params.productId;
        const productInfo = await Products.findOne({ productId: productId });

        if (productInfo == null) {
            res.status(404).json({ massage: "Product not found" });
            return;
        }

        if (isAdminCheck(req)) {
            res.json(productInfo);
        } else {
            if (productInfo.isAvailable) {
                res.json(productInfo);
            } else {
                res.json({ massage: "Product is not availible now" })
            }
        }
    } catch {
        (err) => {
            console.log(err);
            res.status(500).json({ massage: "Failed to fetch product" })
        }
    }

}