const express = require("express");
const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");
const i18n = require("i18n");
const cookieParser = require("cookie-parser");
const Email = require("./mailer");
const TicTacToeApp = require("./lib/tic_tac_toe_app");
const TicTacToeModel = require("./lib/tic_tac_toe_model");

require("dotenv").config();

const app = express();
const PORT_HTTP = 3000; // Puerto para HTTP
const PORT_HTTPS = 443; // Puerto para HTTPS

// Configuración de i18n
i18n.configure({
  locales: ["es", "en"],
  directory: path.join(__dirname, "locales"),
  defaultLocale: "es",
  queryParameter: "lang",
});

app.use(cookieParser());
app.use(i18n.init);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas y lógica de la aplicación
app.get("/", (req, res) => {
  res.render("index", { currentLocale: req.cookies.i18n || "es" });
});

app.get("/change-language/:locale", (req, res) => {
  const locale = req.params.locale;
  res.cookie("i18n", locale, { maxAge: 900000, httpOnly: true });
  req.setLocale(locale);
  app.locals.currentLocale = locale;
  res.redirect("/");
});

app.get("/tateti", function (req, res) {
  res.render("tateti");
});

app.get("/api/tictactoe/:input/:currentTurn", (req, res) => {
  const input = req.params.input.toUpperCase().replace(/ /g, "-");
  const currentTurn = req.params.currentTurn.toUpperCase();
  const model = new TicTacToeModel(input, currentTurn);
  const recommendation = model.getRecommendation();
  console.log(recommendation.index);
  res.send(recommendation);
});

app.post("/api/tictactoe", (req, res) => {
  const input = req.body.input.toUpperCase().replace(/ /g, "-");
  const currentTurn = req.body.currentTurn.toUpperCase();
  const model = new TicTacToeModel(input, currentTurn);
  const recommendation = model.getRecommendation();
  console.log(recommendation.index);
  res.send(recommendation);
});

app.use((req, res, next) => {
  const currentLocale = req.cookies.i18n || "es"; // Si no se encuentra la cookie, se establece el valor 'es' por defecto.
  app.locals.currentLocale = currentLocale;
  next();
});

// Configuramos el archivo donde se guardarán los datos
const archivoContactos = path.join(__dirname, "public", "contactos.html");

// Comprobamos si el archivo existe, si no, lo creamos con una tabla vacía
if (!fs.existsSync(archivoContactos)) {
  fs.writeFileSync(
    archivoContactos,
    "<tr><th>Nombre</th><th>Correo</th><th>Mensaje</th></tr>"
  );
}

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

app.post("/contacto", async (req, res) => {
  const { nombre, email, mensaje } = req.body;
  if (!nombre || !email || !mensaje) {
    return res
      .status(400)
      .json({ error: "Por favor, complete todos los campos" });
  }

  // Agregamos los datos a la tabla en el archivo HTML
  const tabla = `<tr><td>${nombre}</td><td>${email}</td><td>${mensaje}</td></tr>`;
  fs.appendFileSync(archivoContactos, tabla);

  let correo = {
    from: "sender@newdanger.com.ar",
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

  try {
    await oEmail.enviarCorreo(correo);
    res.status(200).json({ message: "Mensaje enviado correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al enviar el mensaje" });
  }
});

// Configuración de certificados SSL
if (process.env.NODE_ENV === "production") {
  const privateKey = fs.readFileSync(
    "/etc/letsencrypt/live/gastongracis.dev/privkey.pem",
    "utf8"
  );
  const certificate = fs.readFileSync(
    "/etc/letsencrypt/live/gastongracis.dev/fullchain.pem",
    "utf8"
  );
  const credentials = { key: privateKey, cert: certificate };

  // Crear el servidor HTTPS
  https.createServer(credentials, app).listen(PORT_HTTPS, () => {
    console.log(`Servidor HTTPS corriendo en el puerto ${PORT_HTTPS}`);
  });
}

//
app.use((req, res, next) => {
  console.log(`Ruta no encontrada: ${req.originalUrl}`);
  res.status(404).render("404", { pageTitle: "Página no encontrada" });
  res.status(404).send("Ruta no encontrada");
});

// Iniciar el servidor HTTP
http.createServer(app).listen(PORT_HTTP, () => {
  console.log(`Servidor HTTP corriendo en el puerto ${PORT_HTTP}`);
});

// Opcional: redirigir HTTP a HTTPS
const httpApp = express();
httpApp.all("*", (req, res) => {
  res.redirect(301, `https://${req.hostname}${req.url}`);
});
const httpServer = http.createServer(httpApp);
httpServer.listen(80, () => {
  console.log("HTTP Server running on port 80 and redirecting to HTTPS");
});
