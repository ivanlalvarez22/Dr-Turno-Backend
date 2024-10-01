import jwt from "jsonwebtoken";
import Doctor from "../models/DoctorSchema.js";
import User from "../models/UserSchema.js";

export const authenticate = async (req, res, next) => {
  // obtener el token de los headers
  const authToken = req.headers.authorization;

  // verificar si el token existe
  if (!authToken || !authToken.startsWith("Bearer")) {
    return res.status(401).json({
      success: false,
      message: "Sin token, autorización denegada.",
    });
  }

  try {
    const token = authToken.split(" ")[1];

    // verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    req.userId = decoded.id;
    req.role = decoded.role;

    next(); // se debe llamar a la siguiente función
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token vencido, por favor inicie sesión nuevamente.",
      });
    }

    return res.status(401).json({
      success: false,
      message:
        "Necesita crear una cuenta e iniciar sesión para realizar esta acción.",
    });
  }
};

export const restrict = (roles) => async (req, res, next) => {
  const userId = req.userId;

  let user;

  const patient = await User.findById(userId);
  const doctor = await Doctor.findById(userId);

  if (patient) {
    user = patient;
  } else if (doctor) {
    user = doctor;
  }

  // Verificar si el usuario se encontró y si su rol está en los roles permitidos
  if (!user || !roles.includes(user.role)) {
    return res.status(401).json({
      success: false,
      message: "No estás autorizado para realizar esta acción.",
    });
  }

  next();
};
