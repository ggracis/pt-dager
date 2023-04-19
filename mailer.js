const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

class Email {
  constructor(oConfig) {
    this.transporter = nodemailer.createTransport({
      host: oConfig.host,
      port: oConfig.port,
      secure: oConfig.secure,
      auth: {
        user: oConfig.auth.user,
        pass: oConfig.auth.pass,
      },
    });
  }

  enviarCorreo(oEmail) {
    try {
      this.transporter.sendMail(oEmail, (error, info) => {
        if (error) {
          console.log("Error al enviar el correo: " + error);
        } else {
          console.log("Correo enviado: " + info.response);
        }
        this.transporter.close();
      });
    } catch (x) {
      console.log("Error al enviar el correo: " + x);
    }
  }
}
module.exports = Email;
