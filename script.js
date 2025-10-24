document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formSuscripcion");

  cargarDatosGuardados();

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
    error.className = "error-mensaje";
    input.insertAdjacentElement("afterend", error);
  }

  function eliminarError(input) {
    const siguiente = input.nextElementSibling;
    if (siguiente && siguiente.className === "error-mensaje") {
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

  function cargarDatosGuardados() {
    const datosGuardados = localStorage.getItem('suscripcionExitosa');
    if (datosGuardados) {
      const datos = JSON.parse(datosGuardados);
      console.log('Datos de suscripción cargados:', datos);
    }
  }

  function mostrarModal(titulo, mensaje, datos = null, esExitoso = false) {
    let modal = document.getElementById('modalSuscripcion');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modalSuscripcion';

      const modalContent = document.createElement('div');
      modalContent.className = `modal-content ${esExitoso ? 'modal-exito' : 'modal-error'}`;

      modalContent.innerHTML = `
        <h3 id="modalTitulo">${titulo}</h3>
        <p id="modalMensaje">${mensaje}</p>
        <div id="modalDatos"></div>
        <button id="cerrarModal">Cerrar</button>
      `;

      modal.appendChild(modalContent);
      document.body.appendChild(modal);

      document.getElementById('cerrarModal').addEventListener('click', () => {
        document.body.removeChild(modal);
      });
    } else {
      const modalContent = modal.querySelector('.modal-content');
      modalContent.className = `modal-content ${esExitoso ? 'modal-exito' : 'modal-error'}`;
      document.getElementById('modalTitulo').textContent = titulo;
      document.getElementById('modalMensaje').textContent = mensaje;
    }

    const datosContainer = document.getElementById('modalDatos');
    if (datos && esExitoso) {
      datosContainer.style.display = 'block';
      datosContainer.textContent = JSON.stringify(datos, null, 2);
    } else {
      datosContainer.style.display = 'none';
    }
  }

  async function enviarDatosAlServidor(datos) {
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Suscripción Newsletter',
          body: JSON.stringify(datos),
          userId: 1
        })
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const respuesta = await response.json();
      return { exito: true, datos: respuesta };

    } catch (error) {
      return { exito: false, error: error.message };
    }
  }

  Object.keys(validaciones).forEach(id => {
    const input = document.getElementById(id);

    input.addEventListener("blur", () => {
      const valor = input.value.trim();
      const datos = obtenerDatos();

      if (valor === "") {
        mostrarError(input, mensajes.requerido);
        input.classList.add('invalido');
        input.classList.remove('valido');
        return;
      }

      const valido = id === "repetirPassword"
        ? validaciones[id](valor, datos)
        : validaciones[id](valor);

      if (!valido) {
        mostrarError(input, mensajes[id]);
        input.classList.add('invalido');
        input.classList.remove('valido');
      } else {
        eliminarError(input);
        input.classList.add('valido');
        input.classList.remove('invalido');
      }
    });

    input.addEventListener("focus", () => {
      eliminarError(input);
      input.classList.remove('invalido', 'valido');
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const datos = obtenerDatos();
    let todoValido = true;

    Object.keys(validaciones).forEach(id => {
      const input = document.getElementById(id);
      const valor = datos[id];

      if (valor === "") {
        mostrarError(input, mensajes.requerido);
        input.classList.add('invalido');
        todoValido = false;
        return;
      }

      const valido = id === "repetirPassword"
        ? validaciones[id](valor, datos)
        : validaciones[id](valor);

      if (!valido) {
        mostrarError(input, mensajes[id]);
        input.classList.add('invalido');
        todoValido = false;
      } else {
        input.classList.add('valido');
      }
    });

    if (!todoValido) {
      mostrarModal('Error de Validación', 'Por favor, corrige los errores en el formulario antes de enviar.', null, false);
      return;
    }

    const boton = form.querySelector('button[type="submit"]');
    const textoOriginal = boton.textContent;
    boton.textContent = 'Enviando...';
    boton.disabled = true;

    try {
      const resultado = await enviarDatosAlServidor(datos);

      if (resultado.exito) {
        localStorage.setItem('suscripcionExitosa', JSON.stringify(resultado.datos));

        mostrarModal(
          '¡Suscripción Exitosa!',
          'Tu suscripción al newsletter se ha completado correctamente.',
          resultado.datos,
          true
        );

        form.reset();
        Object.keys(validaciones).forEach(id => {
          const input = document.getElementById(id);
          input.classList.remove('valido', 'invalido');
          eliminarError(input);
        });

      } else {
        mostrarModal('Error en el Servidor', `No se pudo completar la suscripción: ${resultado.error}`, null, false);
      }

    } catch (error) {
      mostrarModal('Error', `Ocurrió un error inesperado: ${error.message}`, null, false);
    } finally {
      boton.textContent = textoOriginal;
      boton.disabled = false;
    }
  });
});