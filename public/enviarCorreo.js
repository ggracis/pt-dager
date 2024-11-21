document.addEventListener("DOMContentLoaded", function () {
  const enviarFormulario = (formPrefix = "") => {
    const nombre = document.getElementById(`nombre${formPrefix}`).value;
    const email = document.getElementById(`email${formPrefix}`).value;
    const mensaje = document.getElementById(`mensaje${formPrefix}`).value;
    const resultDiv = document.getElementById(`form-result${formPrefix}`);

    if (!nombre || !email || !mensaje) {
      resultDiv.innerHTML =
        '<div class="alert alert-danger">Por favor, complete todos los campos</div>';
      return;
    }

    fetch("/contacto", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nombre, email, mensaje }),
    })
      .then((response) => response.json())
      .then((data) => {
        document.getElementById(`nombre${formPrefix}`).value = "";
        document.getElementById(`email${formPrefix}`).value = "";
        document.getElementById(`mensaje${formPrefix}`).value = "";
        resultDiv.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
      })
      .catch((error) => {
        resultDiv.innerHTML =
          '<div class="alert alert-danger">Error al enviar el mensaje</div>';
      });
  };

  // Formulario desktop
  document
    .getElementById("enviar-formulario")
    ?.addEventListener("click", (e) => {
      e.preventDefault();
      enviarFormulario("");
    });

  // Formulario móvil
  document
    .getElementById("enviar-formulario-celu")
    ?.addEventListener("click", (e) => {
      e.preventDefault();
      enviarFormulario("-celu");
    });
});
