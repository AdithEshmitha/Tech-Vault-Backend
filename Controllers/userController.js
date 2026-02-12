import axios from "axios";
import Users from "../Models/userModel.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


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