const express = require("express");
const https = require("https");
const http = require("http");
const axios = require("axios");
const Email = require("./mailer");
const fs = require("fs");
const i18n = require("i18n");
const cookieParser = require("cookie-parser");

const app = express();
const path = require("path");
const bodyParser = require("body-parser");

var TicTacToeApp = require("./lib/tic_tac_toe_app");

var input = ("" + process.argv[2]).toUpperCase().replace(/ /g, "-");
var currentTurn = ("" + process.argv[3]).toUpperCase();
var debug = ("" + process.argv[4]).toUpperCase() == "DEBUG";

new TicTacToeApp(input, currentTurn, debug);

// Configurar i18n
i18n.configure({
  locales: ["es", "en"],
  directory: __dirname + "/locales",
  defaultLocale: "es",
  queryParameter: "lang",
});

// Agregar el middleware de i18n a la cadena de manejo de solicitudes
app.use(cookieParser());
app.use(i18n.init);

app.use(function (req, res, next) {
  res.locals.currentLocale = req.getLocale();
  next();
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
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

const TicTacToeModel = require("./lib/tic_tac_toe_model");

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

app.use((req, res, next) => {
  res.status(404).render("404", { pageTitle: "Página no encontrada" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
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

  oEmail.enviarCorreo(correo);
  res.status(200).json({ message: "Mensaje enviado correctamente" });
});

// Configuración de certificados SSL
// Lee los certificados SSL
const privateKey = fs.readFileSync(
  "/etc/letsencrypt/live/gastongracis.dev/privkey.pem",
  "utf8"
);
const certificate = fs.readFileSync(
  "/etc/letsencrypt/live/gastongracis.dev/fullchain.pem",
  "utf8"
);

const credentials = {
  key: privateKey,
  cert: certificate,
};

// Crear el servidor HTTPS
const httpsServer = https.createServer(credentials, app); // Aquí estaba credentials1, lo he corregido a credentials

httpsServer.listen(443, () => {
  console.log("HTTPS Server running on port 443");
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
