import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  message: { type: String, required: true },
  doctor: {
    type: mongoose.Types.ObjectId,
    ref: "Doctor",
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  date: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
});

export default mongoose.model("Notification", NotificationSchema);
