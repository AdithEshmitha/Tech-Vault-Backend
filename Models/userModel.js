import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        fullName: { type: String, require: true },
        email: { type: String, require: true, unique: true },
        password: { type: String, require: true },
        mobileNumber: { type: Number, require: true },
        role: { type: String, default: "user" },
        isBlocked: { type: Boolean, default: false },
        isEmailVeryfied: { type: Boolean, default: false },
        profileImage: { type: String, default: "https:example.com/image01" }
    }
); ``

const Users = mongoose.model("users", userSchema);

export default Users;