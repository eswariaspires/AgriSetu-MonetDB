import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
{
connectionId: {
type: mongoose.Schema.Types.ObjectId,
ref: "Connection",
required: true,
unique: true,
},
buyerId: {
type: mongoose.Schema.Types.ObjectId,
ref: "User",
required: true,
},
farmerId: {
type: mongoose.Schema.Types.ObjectId,
ref: "User",
required: true,
},
produceId: {
type: String,
required: true,
},
qualityRating: {
type: Number,
required: true,
min: 1,
max: 5,
validate: Number.isInteger,
},
serviceRating: {
type: Number,
required: true,
min: 1,
max: 5,
validate: Number.isInteger,
},
overallRating: {
type: Number,
required: true,
min: 1,
max: 5,
validate: Number.isInteger,
},
comment: {
type: String,
trim: true,
maxlength: 1000,
default: "",
},
},
{ timestamps: true }
);

reviewSchema.index({ farmerId: 1, createdAt: -1 });
reviewSchema.index({ produceId: 1, createdAt: -1 });

export default mongoose.model("Review", reviewSchema);
