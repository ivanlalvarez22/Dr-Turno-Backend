import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  dni: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: Number },
  photo: { type: String },
  role: {
    type: String,
    enum: ["admin", "patient", "secretary"],
    default: "patient",
  },
  gender: {
    type: String,
    enum: ["masculino", "femenino", "otro"],
    default: "otro",
  },
  bloodType: { type: String },
  healthInsurance: { type: String, default: "No especifica" },
  appointments: [{ type: mongoose.Types.ObjectId, ref: "Booking" }],
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },
  notifications: [{ type: mongoose.Types.ObjectId, ref: "Notification" }],
});

export default mongoose.model("User", UserSchema);
