import Notification from "./../models/NotificationSchema.js";

// Obtener todas las notificaciones
export const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({});

    res.status(200).json({
      success: true,
      message: "Notificaciones obtenidas correctamente",
      data: notifications,
    });
  } catch (error) {
    console.error("Error al obtener las notificaciones:", error);
    res.status(500).json({
      success: false,
      message: "Error del servidor al obtener las notificaciones",
    });
  }
};

// Marcar una notificación como leída
export const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    // Buscar la notificación por su ID en la base de datos
    const notification = await Notification.findById(notificationId);

    // Verificar si la notificación existe
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notificación no encontrada",
      });
    }

    // Marcar la notificación como leída
    notification.read = true;

    // Guardar los cambios en la base de datos
    await notification.save();

    // Responder con éxito
    res.status(200).json({
      success: true,
      message: "Notificación marcada como leída exitosamente",
      data: notification,
    });
  } catch (error) {
    console.error("Error al marcar la notificación como leída:", error);
    res.status(500).json({
      success: false,
      message: "Error del servidor al marcar la notificación como leída",
    });
  }
};
