
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    connectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Connection",
      required: true,
    },
    type: {
      type: String,
      enum: ["request", "accepted", "rejected"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Prevent the same event from creating duplicate notifications.
notificationSchema.index(
  { recipientId: 1, connectionId: 1, type: 1 },
  { unique: true }
);

export default mongoose.model("Notification", notificationSchema);
