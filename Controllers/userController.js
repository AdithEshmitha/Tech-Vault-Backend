import axios from "axios";
import Users from "../Models/userModel.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
import nodemailer from 'nodemailer';
import OTP from "../Models/otpModel.js";

dotenv.config();

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: "aditheshmitha2008@gmail.com",
        pass: process.env.APP_PASSWORD
    }
})


// Register New User
export function createUser(req, res) {

    const hashPassword = bcrypt.hashSync(req.body.password, 10);

    const userData = {
        fullName: req.body.fullName,
        email: req.body.email,
        password: hashPassword,
        mobileNumber: req.body.mobileNumber,
        role: req.body.role
    }

    const user = new Users(userData);

    user.save().then(
        () => {
            res.json({ massage: "User Registered Successfully" })
        }
    ).catch(
        () => {
            res.status(400).json({ massage: "User Create Failed" })
        }
    );

}

// Login User
export function loginUser(req, res) {
    const email = req.body.email
    const password = req.body.password

    Users.findOne(
        {
            email: email
        }
    ).then(
        (user) => {
            if (user == null) {

                res.status(404).json({ massage: "User not registered" });
                return;

            } else {

                const isPasswordcorrect = bcrypt.compareSync(password, user.password)

                if (isPasswordcorrect) {

                    const token = jwt.sign(
                        {
                            fullName: user.fullName,
                            email: user.email,
                            mobileNumber: user.mobileNumber,
                            role: user.role,
                            isBlocked: user.isBlocked,
                            isEmailVeryfied: user.isEmailVeryfied,
                            profileImage: user.profileImage
                        },
                        "sayu0317"
                    )
                    res.json({ massage: "Login Successfull", token: token });

                } else {
                    res.status(403).json({ massage: "Incorrect Password" });
                }
            }
        }
    ).catch((err) => { res.json(err) });
}

export async function getUser(req, res) {
    try {
        if (req.user == null) {
            res.status(404).json({ massage: "User not found" });
        } else {
            res.json(req.user);
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ massage: "Failed to fetch user", error: err.message });
    }

}


export async function googleLogin(req, res) {
    const googleToken = req.body.token;

    try {
        const googleRes = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: {
                Authorization: `Bearer ${googleToken}`
            }
        });

        const { email, name, picture } = googleRes.data;

        const user = await Users.findOne({ email: email });

        if (user) {
            const token = jwt.sign(
                {
                    fullName: user.fullName,
                    email: user.email,
                    role: user.role,
                    profileImage: user.profileImage
                },
                "sayu0317"
            );

            return res.json({ message: "Login Successful", token: token, role: user.role });
        } else {
            const newUser = new Users({
                fullName: name,
                email: email,
                password: "123",
                role: "user",
                isEmailVeryfied: true,
                profileImage: picture
            });

            const savedUser = await newUser.save();

            const token = jwt.sign(
                {
                    fullName: savedUser.fullName,
                    email: savedUser.email,
                    role: savedUser.role,
                    profileImage: savedUser.profileImage
                },
                "sayu0317"
            );
            return res.json({ message: "Login Successful", token: token, role: savedUser.role });
        }

    } catch (error) {
        console.error("Google Login Error:", error.response?.data || error.message);
        res.status(500).json({ message: "Failed to fetch user", error: error.message });
    }
}

// Send OTP to Email
export async function sendOTP(req, res) {

    const email = req.body.email;

    try {

        const otpCode = Math.floor(100000 + Math.random() * 900000);

        await OTP.deleteMany({ email: email });
        const newOTP = new OTP({ email: email, otp: otpCode });
        await newOTP.save();

        const message = {
            from: "aditheshmitha2008@gmail.com",
            to: email,
            subject: "Your OTP Code",
            text: `Your OTP code is: ${otpCode}`
        }

        transporter.sendMail(message, (err, info) => {
            if (err) {
                console.log(err);
                res.status(500).json({ message: "Failed to send OTP", error: err.message });
            } else {
                console.log("Email sent: " + info.response);
                res.json({ message: "OTP sent successfully", otp: otpCode });
            }
        })

        res.json({ message: "OTP sent successfully", otp: otpCode });

    } catch (error) {
        return res.status(500).json({ message: "Failed to send OTP", error: error.message });
    }

}


// Reset Password
export async function resetPassword(req, res) {

    const { email, otp, newPassword } = req.body;

    try {

        const otpRecord = await OTP.findOne({ email: email, otp: otp });

        if (!otpRecord) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        const user = await Users.findOne({ email: email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const hashedPassword = bcrypt.hashSync(newPassword, 10);

        await Users.updateOne({ email: email }, { password: hashedPassword });
        await OTP.deleteMany({ email: email });

        res.json({ message: "Password reset successful" });

    } catch (error) {
        return res.status(500).json({ message: "Failed to reset password", error: error.message });
    }

}

// Update User Profile Image
export async function updateProfileImage(req, res) {

    const profileImageUrl = req.body.profileImage;
    const email = req.body.email;

    try {

        const user = await Users.findOne({ email: email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Fixed: Added the update condition and proper update syntax
        await Users.updateOne(
            { email: email }, // Find user by email
            { $set: { profileImage: profileImageUrl } } // Update profileImage field
        );

        res.json({ message: "Profile image updated successfully", profileImage: profileImageUrl });

    } catch (error) {
        return res.status(500).json({ message: "Failed to update profile image", error: error.message });
    }

}


export async function updateProfile(req, res) {
    const { fullName, mobileNumber, email } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    try {
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const user = await Users.findOne({ email: email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        await Users.updateOne(
            { email: email },
            {
                $set: {
                    fullName: fullName,
                    mobileNumber: mobileNumber
                }
            }
        );

        res.json({
            message: "Profile updated successfully",
            user: {
                fullName,
                mobileNumber,
                email
            }
        });

    } catch (error) {
        return res.status(500).json({ message: "Failed to update profile", error: error.message });
    }
}




// Authontication User
export function isAdminCheck(req) {
    if (req.user == null) {
        return false;
    }

    if (req.user.role == "admin") {
        return true;
    } else {
        return false;
    }
}