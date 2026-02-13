import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import userRouter from './Routes/userRouter.js';
import productRouter from './Routes/productRouter.js';
import middlewereAuth from './Middlewere/authonticationMiddlewere.js';
import cors from 'cors';
import orderRouter from './Routes/orderRouter.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();


// MondoDB Connection String
const connectionString = process.env.MONGO_URL;

// Middlewere
app.use(bodyParser.json());
app.use(cors());

// Authontication
app.use(express.json());
app.use(middlewereAuth);

// API End-Points
app.use("/api/users", userRouter);
app.use("/api/products", productRouter);
app.use("/api/orders", orderRouter);

// Database Configuration
mongoose.connect(connectionString).then(
    () => {
        console.log("Database Conected");
    }
).catch(
    (err) => {
        console.log(err);
        console.log("Failed to connect Database")
    }
);

// Server Configuration
app.listen(3000, () => {
    console.log("Server Started")
})