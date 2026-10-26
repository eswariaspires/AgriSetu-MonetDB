
import mongoose from "mongoose";

const produceSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    crop: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0.01,
    },
    unit: {
      type: String,
      enum: ["kg", "quintal", "ton"],
      required: true,
    },
    
quality: {
  type: String,
  enum: ["Grade A", "Grade B", "Grade C", "Not sure"],
  default: "Not sure",
},
    date: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    
images: {
  type: [String],
  default: [],
},
    status: {
      type: String,
      enum: ["Available", "Unavailable"],
      default: "Available",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Produce", produceSchema);