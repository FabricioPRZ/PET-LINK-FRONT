const form = document.getElementById("registroForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Obtener todos los campos del formulario
  const nombre = document.getElementById("nombres").value.trim();
  const apePat = document.getElementById("apellido_paterno").value.trim();
  const apeMat = document.getElementById("apellido_materno").value.trim();
  const tipoUsuario = document.getElementById("tipo_usuario").value;
  const ineFile = document.getElementById("foto_ine").files[0];
  const correo = document.getElementById("correo").value.trim();
  const pass = document.getElementById("contraseña").value;
  const confirmPass = document.getElementById("confirmar_contraseña").value;

  // Validación: campos obligatorios
  if (!nombre || !apePat || !apeMat || !tipoUsuario || !correo || !pass || !confirmPass) {
    alert("Por favor completa todos los campos.");
    return;
  }

  // Validación: contraseñas coinciden
  if (pass !== confirmPass) {
    alert("Las contraseñas no coinciden.");
    return;
  }

  // Validación: archivo INE adjunto
  if (!ineFile) {
    alert("Debes adjuntar tu imagen del INE.");
    return;
  }

  // Crear el cuerpo del FormData
  const formData = new FormData();
  formData.append("tipo_usuario", tipoUsuario);
  formData.append("nombres", nombre);
  formData.append("apellido_paterno", apePat);
  formData.append("apellido_materno", apeMat);
  formData.append("foto_ine", ineFile);
  formData.append("correo", correo);
  formData.append("contraseña", pass);

  try {
    // Enviar solicitud al backend (ajusta la URL si no estás en local)
    const res = await fetch("http://localhost:7070/usuarios", {
      method: "POST",
      body: formData
    });

    if (res.ok) {
      alert("Registro exitoso ✅");
      form.reset();
    } else {
      const errorText = await res.text();
      alert("Error al registrar usuario: " + errorText);
    }
  } catch (err) {
    alert("Error de conexión o servidor: " + err.message);
  }
});
