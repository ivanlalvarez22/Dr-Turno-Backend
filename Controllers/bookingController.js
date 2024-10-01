import User from "../models/UserSchema.js";
import Doctor from "../models/DoctorSchema.js";
import Booking from "../models/BookingSchema.js";
import Notification from "../models/NotificationSchema.js";
import Stripe from "stripe";

export const bookAppointment = async (req, res) => {
  try {
    const userId = req.userId; // Obteniendo el ID del usuario desde la sesión o token
    const { doctorId } = req.params;
    const { time, date } = req.body;

    if (req.role === "doctor") {
      return res.status(400).json({
        success: false,
        message: "Solo los pacientes pueden reservar turnos.",
      });
    }

    // Validar datos de entrada
    if (!time || !date) {
      return res.status(400).json({
        success: false,
        message: "Por favor, seleccione una fecha y hora válidas.",
      });
    }

    const user = await User.findById(userId);
    const doctor = await Doctor.findById(doctorId);
    if (!user) {
      return res.status(403).json({
        success: false,
        message:
          "Necesita crear una cuenta e iniciar sesión para reservar un turno..",
      });
    }

    // Convertir la fecha a formato DD/MM/YYYY
    const originalDate = new Date(date);
    const day = originalDate.getDate();
    const month = originalDate.getMonth() + 1;
    const year = originalDate.getFullYear();
    const formattedDate = `${day < 10 ? "0" : ""}${day}/${
      month < 10 ? "0" : ""
    }${month}/${year}`;

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor no encontrado.",
      });
    }

    // Buscar una reserva existente con los mismos datos y estado pendiente/aprobado
    const existingBooking = await Booking.findOne({
      doctor: doctor._id,
      date: formattedDate, // Usar la fecha formateada
      time,
    });

    if (existingBooking && existingBooking.status !== "cancelado") {
      // Si existe una reserva no cancelada para el mismo doctor en la misma fecha y hora, retornar un error
      return res.status(400).json({
        success: false,
        message:
          "Ya existe una reserva pendiente o aprobada para este doctor en esta fecha y hora.",
      });
    }

    // Crear la reserva
    const booking = new Booking({
      doctor: doctor._id,
      user: userId,
      ticketPrice: doctor.ticketPrice,
      date: formattedDate, // Guardar la fecha formateada
      time,
    });

    // Realizar transacción para guardar la reserva y actualizar el usuario y el médico
    const session = await Booking.startSession();
    session.startTransaction();

    try {
      const savedBooking = await booking.save({ session });

      // Actualizar el usuario y el médico con el ID de la reserva creada
      await Promise.all([
        User.findByIdAndUpdate(
          userId,
          { $push: { appointments: savedBooking._id } },
          { session }
        ),
        Doctor.findByIdAndUpdate(
          doctorId,
          { $push: { appointments: savedBooking._id } },
          { session }
        ),
      ]);

      await session.commitTransaction();

      res.status(200).json({
        success: true,
        message: "Turno agendado exitosamente.",
        booking: savedBooking,
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: "Error al reservar turno: " + error.message,
    });
  }
};

// Controlador para actualizar el estado de una reserva
export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    // Verificar si el estado proporcionado es válido
    if (status !== "aprobado" && status !== "cancelado") {
      return res.status(400).json({
        success: false,
        message: "Invalid status provided",
      });
    }

    // Buscar la reserva por su ID
    const booking = await Booking.findById(bookingId).populate("user");

    // Verificar si la reserva existe
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Actualizar el estado de la reserva
    booking.status = status;
    await booking.save();

    // Crear el mensaje de la notificación con salto de línea
    const notificationMessage = `El turno para el día ${booking.date} a las ${booking.time} fue ${status}`;

    // Crear la notificación
    const notification = new Notification({
      message: notificationMessage,
      date: new Date(),
      read: false,
      user: booking.user._id, // Agregar ID del usuario
      doctor: booking.doctor._id, // Agregar ID del doctor
    });

    // Guardar la notificación en la base de datos
    await notification.save();

    // Agregar la referencia de la notificación al usuario
    if (req.role === "doctor") {
      const user = await User.findById(booking.user._id);
      user.notifications.push(notification._id);
      await user.save();
    }

    // Agregar la referencia de la notificación al doctor
    if (req.role === "patient") {
      const doctor = await Doctor.findById(booking.doctor._id);
      doctor.notifications.push(notification._id);
      await doctor.save();
    }

    res.status(200).json({
      success: true,
      message: `Booking status updated to ${status}`,
      booking,
    });
  } catch (err) {
    console.error("Error updating booking status:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getCheckoutSession = async (req, res) => {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Crear sesión de checkout en Stripe con la moneda en dólares (USD)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${process.env.CLIENT_SITE_URL}checkout-success`,
      cancel_url: `${process.env.CLIENT_SITE_URL}checkout-cancel`,
      line_items: [
        {
          price_data: {
            currency: "usd", // Cambiar a USD para dólares americanos
            unit_amount: 100, // Monto en centavos (aquí $100.00 dólares)
            product_data: {
              name: "Donación",
              description: "Donación para el sitio",
              images: [
                "https://previews.123rf.com/images/berkut2011/berkut20111701/berkut2011170100041/69821062-concepto-de-donaci%C3%B3n-mano-que-pone-la-cuenta-de-dinero-en-la-caja-de-donaciones.jpg",
              ],
            },
          },
          quantity: 1,
        },
      ],
    });

    // Enviar respuesta con la sesión creada y el ID de sesión
    res.status(200).json({
      success: true,
      message: "¡Sesión de pago creada!",
      sessionId: session.id,
      session,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || "Error creando la sesión de pago",
    });
  }
};
