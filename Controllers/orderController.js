import Order from '../Models/orderModel.js';
import Products from '../Models/productModel.js';

// Create a new order
export async function createOrder(req, res) {
    try {

        if (req.user == null) {
            res.status(401).json({ message: "Please login to place an order" });
            return;
        }

        const latestOrder = await Order.find().sort({ date: -1 }).limit(1);
        let orderId = "PDR00202"

        if (latestOrder.length > 0) {
            const latestOrderIdInString = latestOrder[0].orderId;
            const latestOrderIdNumber = latestOrderIdInString.replace("PDR", "");
            const latestOrderIdInt = parseInt(latestOrderIdNumber);
            const newOrderIdInt = latestOrderIdInt + 1;
            const newOrderIdStr = newOrderIdInt.toString().padStart(5, '0');
            orderId = "PDR" + newOrderIdStr;
        }

        const items = [];
        let total = 0;

        if (req.body.items !== null && Array.isArray(req.body.items)) {

            for (let i = 0; i < req.body.items.length; i++) {

                let item = req.body.items[i];

                let product = await Products.findOne({
                    productId: item.productId
                })

                if (product == null) {
                    res.status(404).json({ message: `Product with ID ${item.productId} not found` });
                    return;
                }

                items[i] = {
                    productId: product.productId,
                    name: product.productName,
                    image: product.images[0],
                    price: product.price,
                    qty: item.qty
                }

                total += product.price * item.qty;

            }

        } else {
            res.status(400).json({ message: "Invalid items format" });
            return;
        }

        const order = new Order({
            orderId: orderId,
            email: req.user.email,
            name: req.user.fullName,
            address: req.body.address,
            phone: req.body.phone,
            items: items,
            notes: req.body.notes || "No additional notes",
            total: total
        });

        const result = await order.save();
        res.status(201).json({ message: "Order placed successfully", result: result });

    } catch (err) {
        res.status(500).json({ message: "Failed to place order", error: err.message });
        console.error("Error placing order:", err);
    }

}

// Get all orders
export async function getOrders(req, res) {

    const page = parseInt(req.params.page) || 1;
    const limit = parseInt(req.params.limit) || 10;

    if (req.user == null) {
        res.status(401).json({ massage: "Plese login to view orders" });
        return;
    }

    try {
        if (req.user.role == "admin") {
            const orderCount = await Order.countDocuments();
            const totalPages = Math.ceil(orderCount / limit);
            const orders = await Order.find().skip((page - 1) * limit).limit(limit).sort({ date: -1 });
            res.status(200).json(
                {
                    orders: orders,
                    totalPages: totalPages
                }
            );
        } else {
            const orderCount = await Order.countDocuments();
            const totalPages = Math.ceil(orderCount / limit);
            const orders = await Order.find({ email: req.user.email }).skip((page - 1) * limit).limit(limit).sort({ date: -1 })
            res.status(200).json(
                {
                    orders: orders,
                    tottalPages: totalPages
                }
            );
        }
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch orders", error: err.message });
        console.error("Error fetching orders:", err);
    }

}


// Update Order 
export function updateOrder(req, res) {
    if (req.user.role == "admin") {

        const orderId = req.params.orderId;
        const status = req.body.status;
        const notes = req.body.notes;

        Order.findOneAndUpdate(
            { orderId: orderId },
            { status: status, notes: notes },
            { new: true }
        ).then(
            (updatedOrder) => {
                if (updatedOrder) {
                    res.json({ massage: "Order Updated Successfully", order: updatedOrder });
                } else {
                    res.status(404).json({ massage: "Order not Found" });
                }
            }
        ).catch(
            (error) => {
                console.log(error);
                res.status(500).json({ massage: "Failed to Update Order" })
            }
        )

    } else {
        res.status(403).json(
            {
                massage: "You are not authorized to update order"
            }
        )
    }
}