import User from "../models/UserSchema.js";
import Booking from "../models/BookingSchema.js";
import Doctor from "../models/DoctorSchema.js";

export const updateUser = async (req, res) => {
  const id = req.params.id;
  const { dni } = req.body;

  try {
    // Check if DNI exists for another user
    if (dni) {
      const existingUser = await User.findOne({ dni, _id: { $ne: id } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "El dni ingresado ya existe!",
        });
      }
    }

    const updateUser = await User.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Los datos se actualizaron correctamente!",
      data: updateUser,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error al actualizar datos",
    });
  }
};

export const deleteUser = async (req, res) => {
  const id = req.params.id;

  try {
    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Successfully deleted",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to delete",
      data: updateUser,
    });
  }
};

export const getSingleUser = async (req, res) => {
  const id = req.params.id;

  try {
    const user = await User.findById(id)
      .populate("notifications")
      .populate("appointments")
      .select("-password");

    res.status(200).json({
      success: true,
      message: "User found",
      data: user,
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: "No user found",
      data: updateUser,
    });
  }
};

export const getAllUser = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");

    res.status(200).json({
      success: true,
      message: "Users found",
      data: users,
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: "Not found",
      data: updateUser,
    });
  }
};

export const getUserProfile = async (req, res) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const { password, ...rest } = user._doc;

    res.status(200).json({
      success: true,
      message: "Profile info is getting",
      data: { ...rest },
    });
  } catch (err) {
    res.status(500).json({
      sucess: false,
      message: "Something went wrong, cannot get ",
    });
  }
};

export const getMyAppointments = async (req, res) => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId).populate("appointments");
    const appointments = user.appointments;

    if (!appointments) {
      return res
        .status(404)
        .json({ success: false, message: "Appointments not found" });
    }

    const { password, ...rest } = user._doc;

    res.status(200).json({
      success: true,
      message: "Profile info is getting",
      data: { appointments },
    });
  } catch (err) {
    res.status(500).json({
      sucess: false,
      message: "Something went wrong, cannot get ",
    });
  }
};
