import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ticketPrice: { type: String },
    status: {
      type: String,
      enum: ["pendiente", "aprobado", "cancelado"],
      default: "pendiente",
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    date: { type: String, required: true },
    time: { type: String, required: true },
  },
  { timestamps: true }
);

// Puebla (popula) el campo doctor, seleccionando solo el campo email y name del documento relacionado.
bookingSchema.pre(/^find/, function (next) {
  this.populate("user").populate({
    path: "doctor",
    select: "name email photo specialization",
  });

  next();
});

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
