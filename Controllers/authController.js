import User from "../models/UserSchema.js";
import Doctor from "../models/DoctorSchema.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js"; // Necesitas una función para enviar correos
import dotenv from "dotenv";
dotenv.config();

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: "1d",
    }
  );
};

const generateResetToken = () => {
  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  const resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutos
  return { resetToken, resetPasswordToken, resetPasswordExpire };
};

export const register = async (req, res) => {
  const { email, dni, phone, password, name, role, photo } = req.body;
  try {
    // Busca el usuario por email en ambas colecciones
    const userExists = await Promise.all([
      User.findOne({ email }),
      Doctor.findOne({ email }),
    ]);

    // Verifica si ya existe un usuario con el mismo email en alguna de las colecciones
    if (userExists[0] || userExists[1]) {
      return res.status(400).json({
        message: "ERROR. Ya existe un usuario con este email.",
      });
    }

    // Busca el usuario por DNI en ambas colecciones
    const dniExists = await Promise.all([
      User.findOne({ dni }),
      Doctor.findOne({ dni }),
    ]);

    // Verifica si ya existe un usuario con el mismo DNI en alguna de las colecciones
    if (dniExists[0] || dniExists[1]) {
      return res.status(400).json({
        message: "ERROR. Ya existe un usuario con este DNI.",
      });
    }

    // Hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // Crear un nuevo usuario según el rol
    let user;
    if (role === "patient") {
      user = new User({
        name,
        email,
        dni,
        phone,
        password: hashPassword,
        photo,
        role,
      });
    } else if (role === "doctor") {
      user = new Doctor({
        name,
        email,
        dni,
        phone,
        password: hashPassword,
        photo,
        role,
      });
    }

    // Guardar el usuario en la base de datos
    await user.save();

    res.status(200).json({
      success: true,
      message: "Usuario creado satisfactoriamente",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor, por favor intenta nuevamente.",
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user =
      (await User.findOne({ email })) || (await Doctor.findOne({ email }));

    // check if user exist or not
    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    // compare password
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(400).json({
        status: false,
        message: "La contraseña ingresada es incorrecta",
      });
    }

    // get token
    const token = generateToken(user);

    const { password: pwd, role, appointments, ...rest } = user._doc;

    res.status(200).json({
      status: true,
      token,
      data: { ...rest },
      role,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Failed to login",
    });
  }
};

export const forgottenPassword = async (req, res) => {
  const { email } = req.body;

  try {
    let user =
      (await User.findOne({ email })) || (await Doctor.findOne({ email }));

    // check if user exists or not
    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    const { resetToken, resetPasswordToken, resetPasswordExpire } =
      generateResetToken();

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpire = resetPasswordExpire;
    await user.save();

    const resetUrl = `${process.env.CLIENT_SITE_URL}reset-password/${resetToken}`;

    const message = `Haga clic en el siguiente enlace para restablecer su contraseña: \n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Restablecimiento de contraseña",
        message,
      });

      res.status(200).json({
        success: true,
        message: "Correo enviado con éxito",
      });
    } catch (error) {
      console.log(error);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      return res.status(500).json({
        success: false,
        message: "No se pudo enviar el correo",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false,
      message: "Error interno del servidor",
    });
  }
};

export const resetPassword = async (req, res) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  try {
    let user =
      (await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
      })) ||
      (await Doctor.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
      }));

    // check if user exists or not
    if (!user) {
      return res.status(400).json({
        message: "Token inválido o ha expirado",
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Contraseña restablecida exitosamente",
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Error interno del servidor",
    });
  }
};
