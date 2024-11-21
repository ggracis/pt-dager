const express = require("express");
const fs = require("fs");
const path = require("path");
const i18n = require("i18n");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de i18n
i18n.configure({
  locales: ["es", "en"],
  directory: path.join(__dirname, "locales"),
  defaultLocale: "es",
  queryParameter: "lang",
});

// Middleware
app.use(cookieParser());
app.use(i18n.init);
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Configuración del archivo de contactos
const archivoContactos = path.join(__dirname, "public", "contactos.html");
if (!fs.existsSync(archivoContactos)) {
  fs.writeFileSync(
    archivoContactos,
    "<tr><th>Nombre</th><th>Correo</th><th>Mensaje</th></tr>"
  );
}

// Rutas
app.get("/", (req, res) => {
  res.render("index", { currentLocale: req.cookies.i18n || "es" });
});

app.get("/change-language/:locale", (req, res) => {
  const locale = req.params.locale;
  res.cookie("i18n", locale, { maxAge: 900000, httpOnly: true });
  req.setLocale(locale);
  res.redirect("/");
});

app.post("/contacto", async (req, res) => {
  const { nombre, email, mensaje } = req.body;
  if (!nombre || !email || !mensaje) {
    return res
      .status(400)
      .json({ error: "Por favor, complete todos los campos" });
  }

  const tabla = `<tr><td>${nombre}</td><td>${email}</td><td>${mensaje}</td></tr>`;
  fs.appendFileSync(archivoContactos, tabla);
  res.status(200).json({ message: "Mensaje enviado correctamente" });
});

// Middleware para manejar 404
app.use((req, res) => {
  res.status(404).render("404", { pageTitle: "Página no encontrada" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
