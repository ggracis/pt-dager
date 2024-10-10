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

  async enviarCorreo(oEmail) {
    try {
      const info = await this.transporter.sendMail(oEmail);
      console.log("Correo enviado: " + info.response);
    } catch (error) {
      console.error("Error al enviar el correo: ", error);
    }
  }
}

module.exports = Email;
