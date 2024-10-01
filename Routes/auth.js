import express from "express";
import {
  register,
  login,
  forgottenPassword,
  resetPassword,
} from "../Controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgottenPassword); // Ruta para solicitar restablecimiento de contraseña
router.post("/reset-password/:token", resetPassword); // Ruta para restablecer la contraseña

export default router;
