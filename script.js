document.addEventListener("DOMContentLoaded", () => {
  // Support either id="formulario" (current HTML) or legacy id="formSuscripcion"
  const form =
    document.getElementById("formulario") ||
    document.getElementById("formSuscripcion");

  const validaciones = {
    nombreCompleto: valor => valor.length > 6 && valor.includes(" "),
    email: valor => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor),
    password: valor => /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(valor),
    repetirPassword: (valor, datos) => valor === datos.password,
    edad: valor => Number(valor) >= 18,
    telefono: valor => /^\d{7,}$/.test(valor),
    direccion: valor => /^(?=.*[A-Za-z])(?=.*\d).{5,}$/.test(valor) && valor.includes(" "),
    ciudad: valor => valor.length >= 3,
    codigoPostal: valor => valor.length >= 3,
    dni: valor => /^\d{7,8}$/.test(valor),
  };

  const mensajes = {
    nombreCompleto: "Debe tener más de 6 letras y un espacio.",
    email: "Debe tener un formato de email válido.",
    password: "Debe tener al menos 8 caracteres con letras y números.",
    repetirPassword: "Las contraseñas no coinciden.",
    edad: "Debe ser un número mayor o igual a 18.",
    telefono: "Debe tener al menos 7 dígitos sin espacios ni guiones.",
    direccion: "Debe tener letras, números y un espacio.",
    ciudad: "Debe tener al menos 3 caracteres.",
    codigoPostal: "Debe tener al menos 3 caracteres.",
    dni: "Debe tener 7 u 8 dígitos.",
    requerido: "Este campo es obligatorio."
  };

  function mostrarError(input, mensaje) {
    eliminarError(input);
    const error = document.createElement("p");
    error.textContent = mensaje;
    error.style.color = "red";
    error.style.fontSize = "0.9em";
    input.insertAdjacentElement("afterend", error);
  }

  function eliminarError(input) {
    const siguiente = input.nextElementSibling;
    if (siguiente && siguiente.tagName === "P") {
      siguiente.remove();
    }
  }

  function obtenerDatos() {
    const datos = {};
    Object.keys(validaciones).forEach(id => {
      datos[id] = document.getElementById(id).value.trim();
    });
    return datos;
  }

  Object.keys(validaciones).forEach(id => {
    const input = document.getElementById(id);

    input.addEventListener("blur", () => {
      const valor = input.value.trim();
      const datos = obtenerDatos();

      if (valor === "") {
        mostrarError(input, mensajes.requerido);
        input.style.border = "2px solid red";
        return;
      }

      const valido = id === "repetirPassword"
        ? validaciones[id](valor, datos)
        : validaciones[id](valor);

      if (!valido) {
        mostrarError(input, mensajes[id]);
        input.style.border = "2px solid red";
      } else {
        eliminarError(input);
        input.style.border = "";
      }
    });

    input.addEventListener("focus", () => {
      eliminarError(input);
      input.style.border = "";
    });
  });

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const datos = obtenerDatos();
      let todoValido = true;

      Object.keys(validaciones).forEach(id => {
        const input = document.getElementById(id);
        const valor = datos[id];

        if (valor === "") {
          mostrarError(input, mensajes.requerido);
          input.style.border = "2px solid red";
          todoValido = false;
          return;
        }

        const valido = id === "repetirPassword"
          ? validaciones[id](valor, datos)
          : validaciones[id](valor);

        if (!valido) {
          mostrarError(input, mensajes[id]);
          input.style.border = "2px solid red";
          todoValido = false;
        }
      });

      if (todoValido) {
        form.reset();
        Object.keys(validaciones).forEach(id => {
          const input = document.getElementById(id);
          input.style.border = "";
          eliminarError(input);
        });
      }
    });
  }
});
