
# Dr-Turno-Backend

Este es un sistema de gestión de turnos médicos, desarrollado como parte de un proyecto de práctica profesionalizante en el Instituto Tecnológico de Santiago del Estero (ITSE). El proyecto se compone de un backend y un frontend.

### Descripción

El backend proporciona una API RESTful que permite gestionar los turnos médicos, utilizando tecnologías como Node.js, Express y MongoDB. Los usuarios pueden crear, leer, actualizar y eliminar turnos médicos, así como gestionar la autenticación de usuarios.

### Tecnologías utilizadas

- **Node.js**: Entorno de ejecución para JavaScript en el servidor.
- **Express**: Framework para crear aplicaciones web en Node.js.
- **MongoDB**: Base de datos NoSQL para almacenar datos de forma flexible.
- **Mongoose**: ODM (Object Data Modeling) para MongoDB y Node.js.
- **jsonwebtoken**: Para manejar autenticación y autorización.
- **bcryptjs**: Para el hashing de contraseñas.
- **dotenv**: Para manejar variables de entorno.
- **nodemailer**: Para el envío de correos electrónicos.
- **cors**: Para habilitar el intercambio de recursos entre diferentes dominios.
- **nodemon**: Para reiniciar automáticamente la aplicación durante el desarrollo.

### Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/ivanlalvarez22/Dr-Turno-Backend
   ```

2. Navega al directorio del proyecto:
   ```bash
   cd dr-turno-booking
   ```

3. Instala las dependencias:
   ```bash
   npm install
   ```

4. Crea un archivo `.env` en la raíz del proyecto y agrega las variables necesarias, como la conexión a la base de datos y las configuraciones de autenticación.

### Scripts

- `npm start`: Inicia la aplicación en producción.
- `npm run start-dev`: Inicia la aplicación en modo de desarrollo con nodemon.

### Uso

Una vez que la aplicación esté en funcionamiento, puedes acceder a ella en `http://localhost:5000`. Asegúrate de que el backend esté funcionando para que las llamadas API funcionen correctamente.

---

## Autor

**Ivan Alvarez**

