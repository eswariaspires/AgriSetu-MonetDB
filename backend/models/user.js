
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["farmer", "buyer"],
      required: true,
    },
    phone: {
  type: String,
  trim: true,
},

district: {
  type: String,
  trim: true,
},
state: {
  type: String,
  trim: true,
},

  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User; 