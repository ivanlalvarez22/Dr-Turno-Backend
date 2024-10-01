import mongoose from "mongoose";

const DoctorSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  dni: { type: String, unique: true },
  gender: {
    type: String,
    enum: ["masculino", "femenino", "otro"],
    default: "otro",
  },
  phone: { type: Number },
  photo: {
    type: String,
    default:
      "https://asset.cloudinary.com/dkjfmmclo/ac6e275857ca90f5496b3634abe6d3c6",
  },
  ticketPrice: { type: Number },
  role: {
    type: String,
  },

  // Fields for doctors only
  specialization: { type: String, default: "Doctor" },
  qualifications: {
    type: Array,
  },

  experiences: {
    type: Array,
  },

  bio: { type: String, maxLength: 75 },
  about: { type: String },
  timeSlots: { type: Array },
  reviews: [{ type: mongoose.Types.ObjectId, ref: "Review" }],
  averageRating: {
    type: Number,
    default: 0,
  },
  totalRating: {
    type: Number,
    default: 0,
  },
  isApproved: {
    type: String,
    enum: ["pending", "approved", "cancelled"],
    default: "pending",
  },
  appointments: [{ type: mongoose.Types.ObjectId, ref: "Booking" }],
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },
  notifications: [{ type: mongoose.Types.ObjectId, ref: "Notification" }],
});

export default mongoose.model("Doctor", DoctorSchema);
