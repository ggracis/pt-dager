const express = require("express");
const https = require("https");
const http = require("http");
const axios = require("axios");
const Email = require("./mailer");
const fs = require("fs"); // Agregamos el módulo fs para escribir en archivos

const app = express();
const path = require("path");
const bodyParser = require("body-parser");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuramos el archivo donde se guardarán los datos
const archivoContactos = path.join(__dirname, "public", "contactos.html");

// Comprobamos si el archivo existe, si no, lo creamos con una tabla vacía
if (!fs.existsSync(archivoContactos)) {
  fs.writeFileSync(
    archivoContactos,
    "<tr><th>Nombre</th><th>Correo</th><th>Mensaje</th></tr>"
  );
}

app.get("/", (req, res) => {
  res.render("index");
});

// Certificate for Domain 1
const privateKey1 = fs.readFileSync(
  "/etc/letsencrypt/live/www.gastongracis.dev/privkey.pem",
  "utf8"
);
const certificate1 = fs.readFileSync(
  "/etc/letsencrypt/live/www.gastongracis.dev/cert.pem",
  "utf8"
);
const ca1 = fs.readFileSync(
  "/etc/letsencrypt/live/www.gastongracis.dev/chain.pem",
  "utf8"
);
const credentials1 = {
  key: privateKey1,
  cert: certificate1,
  ca: ca1,
};
// Starting both http & https servers
const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials1, app);

httpServer.listen(80, () => {
  console.log("HTTP Server running on port 80");
});

httpsServer.listen(443, () => {
  console.log("HTTPS Server running on port 443");
});

const oEmail = new Email({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    type: "login",
    user: "sender@newdanger.com.ar",
    pass: "CND2023!Mailer",
  },
});

app.post("/contacto", (req, res, next) => {
  const { nombre, email, mensaje } = req.body; // Utilizamos destructuring para obtener las variables
  if (!nombre || !email || !mensaje) {
    return res
      .status(400)
      .json({ error: "Por favor, complete todos los campos" });
  }

  // Agregamos los datos a la tabla en el archivo HTML
  const tabla = `<tr><td>${nombre}</td><td>${email}</td><td>${mensaje}</td></tr>`;
  fs.appendFileSync(archivoContactos, tabla);

  let correo = {
    from: "mailer@newdanger.com.ar",
    to: "gastongracis@gmail.com",
    subject: "[CONTACTO]",
    html: `
      <h1>Información de contacto</h1>
      <ul>
        <li>Nombre: ${nombre}</li>
        <li>Correo: ${email}</li>
      </ul>
      <p>Mensaje: ${mensaje}</p>
    `,
  };

  oEmail.enviarCorreo(correo);
  res.status(200).json({ message: "Mensaje enviado correctamente" });
});

app.use((req, res, next) => {
  res.status(404).render("404", { pageTitle: "Página no encontrada" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
});
