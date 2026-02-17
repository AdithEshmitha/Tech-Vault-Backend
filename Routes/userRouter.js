import express from 'express';
import { createUser, getAllUsers, getUser, googleLogin, loginUser, resetPassword, sendOTP, updateProfile, updateProfileImage } from '../Controllers/userController.js';

const userRouter = express.Router();

userRouter.post("/", createUser);
userRouter.get("/", getUser);
userRouter.get("/all-users", getAllUsers);
userRouter.post("/login", loginUser);
userRouter.post("/google-login", googleLogin);
userRouter.post("/send-otp", sendOTP);
userRouter.post("/reset-password", resetPassword);
userRouter.post("/update-profile", updateProfileImage);
userRouter.post("/update-profile-data", updateProfile);

export default userRouter;