// Enviar formulario de contacto
document
  .getElementById("enviar-formulario")
  .addEventListener("click", function () {
    let nombre = document.getElementById("nombre").value;
    let email = document.getElementById("email").value;
    let mensaje = document.getElementById("mensaje").value;
    if (!nombre || !email || !mensaje) {
      document.getElementById("form-result").innerHTML =
        '<div class="alert alert-danger">' +
        "Por favor, complete todos los campos" +
        "</div>";
      return;
    } else {
      const data = {
        nombre,
        email,
        mensaje,
      };
      axios
        .post("/contacto", data)
        .then(function (response) {
          console.log(response);
          document.getElementById("nombre").value = "";
          document.getElementById("email").value = "";
          document.getElementById("mensaje").value = "";
          document.getElementById("form-result").innerHTML =
            '<div class="alert alert-success">' +
            response.data.message +
            "</div>";
        })
        .catch(function (error) {
          console.log(error);
          document.getElementById("form-result").innerHTML =
            '<div class="alert alert-danger">' +
            "Error al enviar el mensaje" +
            "</div>";
        });
    }
  });

// Enviar formulario de contacto desde Celu
document
  .getElementById("enviar-formulario-celu")
  .addEventListener("click", function () {
    let nombre = document.getElementById("nombre-celu").value;
    let email = document.getElementById("email-celu").value;
    let mensaje = document.getElementById("mensaje-celu").value;
    if (!nombre || !email || !mensaje) {
      document.getElementById("form-result-celu").innerHTML =
        '<div class="alert alert-danger">' +
        "Por favor, complete todos los campos" +
        "</div>";
      return;
    } else {
      const data = {
        nombre,
        email,
        mensaje,
      };
      axios
        .post("/contacto", data)
        .then(function (response) {
          console.log(response);
          document.getElementById("nombre-celu").value = "";
          document.getElementById("email-celu").value = "";
          document.getElementById("mensaje-celu").value = "";
          document.getElementById("form-result-celu").innerHTML =
            '<div class="alert alert-success">' +
            response.data.message +
            "</div>";
        })
        .catch(function (error) {
          console.log(error);
          document.getElementById("form-result-celu").innerHTML =
            '<div class="alert alert-danger">' +
            "Error al enviar el mensaje" +
            "</div>";
        });
    }
  });
