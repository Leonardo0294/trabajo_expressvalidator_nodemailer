import "dotenv/config";
import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import { createTransport } from "nodemailer";

const app = express();

// Middleware para el registro de solicitudes
app.use(morgan("dev"));
// Middleware de seguridad
app.use(helmet());
// Middleware para habilitar CORS
app.use(cors());
// Middleware para analizar JSON en las solicitudes
app.use(express.json());

// Función para enviar correos electrónicos
async function enviarEmail({ subject, text, toEmail }) {
  const config = {
    host: "smtp.gmail.com",
    port: 587,
    auth: {
      user: process.env.usermail, // Utiliza la variable de entorno para el correo del remitente
      pass: process.env.passwordmail, // Utiliza la variable de entorno para la contraseña del remitente
    },
  };

  const transporter = createTransport(config);

  const message = {
    from: process.env.usermail, // Configura el correo del remitente
    to: toEmail, // Configura el correo del destinatario
    subject,
    text,
  };

  try {
    const info = await transporter.sendMail(message);
    console.log("Correo electrónico enviado:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error al enviar el correo electrónico:", error);
    throw error;
  }
}

// Ruta para recibir solicitudes POST
app.post("/", async (req, res) => {
  try {
    const sentInfo = await enviarEmail(req.body); // Llama a la función para enviar el correo con la información del cuerpo de la solicitud

    res.status(200).json(sentInfo);
  } catch (error) {
    console.log(error); // Registra cualquier error en la consola

    res.status(500).json({ error: "Error al enviar el correo electrónico" });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
