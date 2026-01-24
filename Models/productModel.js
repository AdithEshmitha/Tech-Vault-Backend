import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
    {
        productId: { type: String, require: true, unique: true },
        productName: { type: String, require: true },
        description: { type: String, require: true },
        images: { type: [String], require: true },
        labelledPrice: { type: Number, require: true },
        price: { type: Number, require: true },
        category: { type: String, require: true },
        stock: { type: Number, require: true, default: 0 },
        isAvailable: { type: Boolean, require: true }
    }
);

const Products = mongoose.model("products", productSchema);

export default Products;
