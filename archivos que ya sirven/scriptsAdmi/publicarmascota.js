const API = "http://44.208.231.53:7078/solicitudes-cedente";
let modoEdicion = false;
let idMascotaActual = null;
let idSolicitudCedenteActual = null;
let idUsuarioAdministrador = 1;

// Cargar mascota desde publicación (ejemplo: ?id=3 en URL)
window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const idPublicacion = parseInt(params.get("id"));

  if (!idPublicacion || isNaN(idPublicacion)) {
    alert("La URL no contiene un ID válido de publicación.");
    return;
  }

  cargarMascotaDesdePublicacion(idPublicacion);
});

// Botones
document.getElementById("btnCrear").addEventListener("click", crearPublicacion);
document.getElementById("btnActualizar").addEventListener("click", actualizarMascota);
document.getElementById("btnEliminar").addEventListener("click", eliminarMascota);
document.getElementById("toggleEdicion").addEventListener("click", toggleEdicion);

// Obtener datos
async function cargarMascotaDesdePublicacion(idPublicacion) {
  try {
    const pub = await fetch(`${API}/publicaciones/${idPublicacion}`).then(r => r.json());
    const mascota = await fetch(`${API}/mascotas/${pub.Codigo}`).then(r => r.json());
    const especie = await fetch(`${API}/especies/${mascota.codigo_especie}`).then(r => r.json());
    const tamano = await fetch(`${API}/tamanos/${mascota.codigo_tamaño}`).then(r => r.json());
    const solicitud = await fetch(`${API}/solicitudes-cedente/${pub.codigo_solicitudCedente}`).then(r => r.json());

    const relaciones = await fetch(`${API}/mascotas-vacunas`).then(r => r.json());
    const vacunasAplicadas = relaciones.filter(app => app.codigo_mascota === mascota.id_mascotas);

    const listaVacunas = [];
    for (const app of vacunasAplicadas) {
      const vacuna = await fetch(`${API}/vacunas/${app.codigo_vacuna}`).then(r => r.json());
      listaVacunas.push(vacuna.nombreVacuna);
    }

    idMascotaActual = mascota.id_mascotas;
    idSolicitudCedenteActual = pub.codigo_solicitudCedente;

    mostrarDatos({ mascota, especie, tamano, fotos: solicitud.fotos_mascotas, vacunas: listaVacunas });
  } catch (error) {
    console.error("Error:", error);
    alert("Error al cargar datos");
  }
}

// Renderizar datos
function mostrarDatos({ mascota, especie, tamano, fotos, vacunas }) {
  setText("nombreMascota", mascota.nombre_mascotas);
  setText("especieMascota", especie.nombre);
  setText("sexoMascota", mascota.sexo);
  setText("desparasitado", mascota.desparasitado);
  setText("tamanoMascota", tamano.descripcion);
  setText("discapacitado", mascota.discapacitado);
  setText("enfermedades", mascota.enfermedades || "Ninguna");
  setText("edadMascota", mascota.edad || "—");
  setText("pesoMascota", mascota.peso ? `${mascota.peso} kg` : "—");
  setText("tratamientos", mascota.tratamientos || "—");
  setText("esterilizado", mascota.esterilizado);
  setText("descripcionMascota", mascota.descripcion || "—");

  const imagenes = fotos ? fotos.split(",") : [];
  document.getElementById("imagenPrincipal").src = imagenes[0] || "/mascotas/default.jpg";
  const thumbs = document.getElementById("imagenesMiniatura");
  thumbs.innerHTML = "";
  imagenes.slice(1).forEach(url => {
    const img = document.createElement("img");
    img.src = url;
    thumbs.appendChild(img);
  });

  const lista = document.getElementById("listaVacunas");
  lista.innerHTML = "";
  vacunas.length
    ? vacunas.forEach(nombre => {
        const li = document.createElement("li");
        li.textContent = nombre;
        lista.appendChild(li);
      })
    : lista.appendChild(Object.assign(document.createElement("li"), { textContent: "—" }));
}

// Inputs o texto según modo
function setText(id, valor) {
  const el = document.getElementById(id);
  if (modoEdicion) {
    const input = document.createElement("input");
    input.type = "text";
    input.value = valor;
    input.id = `edit-${id}`;
    input.className = "info-value";
    el.replaceWith(input);
  } else {
    el.textContent = valor;
  }
}

// Activar modo edición
function toggleEdicion() {
  modoEdicion = !modoEdicion;
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get("id"));
  if (!isNaN(id)) cargarMascotaDesdePublicacion(id);
}

// Crear publicación
async function crearPublicacion() {
  if (!idMascotaActual || !idSolicitudCedenteActual) return alert("Faltan datos");

  const nueva = {
    estado_publicacion: "Disponible",
    codigo: idMascotaActual,
    codigo_solicitudCedente: idSolicitudCedenteActual,
    codigo_usuario: idUsuarioAdministrador
  };

  try {
    const res = await fetch(`${API}/publicaciones`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nueva)
    });

    if (res.ok) {
      alert("✅ Publicación creada");
    } else {
      const msg = await res.text();
      alert("❌ Error: " + msg);
    }
  } catch (error) {
    console.error("Error al publicar:", error);
    alert("Error inesperado al crear publicación.");
  }
}

// Actualizar mascota
async function actualizarMascota() {
  const actualizada = {
    nombre_mascotas: document.getElementById("edit-nombreMascota")?.value,
    sexo: document.getElementById("edit-sexoMascota")?.value,
    desparasitado: document.getElementById("edit-desparasitado")?.value,
    discapacitado: document.getElementById("edit-discapacitado")?.value,
    enfermedades: document.getElementById("edit-enfermedades")?.value,
    edad: document.getElementById("edit-edadMascota")?.value,
    peso: document.getElementById("edit-pesoMascota")?.value,
    tratamientos: document.getElementById("edit-tratamientos")?.value,
    esterilizado: document.getElementById("edit-esterilizado")?.value,
    descripcion: document.getElementById("edit-descripcionMascota")?.value
  };

  try {
    const res = await fetch(`${API}/mascotas/${idMascotaActual}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(actualizada)
    });

    if (res.ok) {
      alert("✅ Mascota actualizada");
      modoEdicion = false;
      location.reload();
    } else {
      const msg = await res.text();
      alert("❌ Error: " + msg);
    }
  } catch (error) {
    console.error("Error al actualizar:", error);
    alert("Error inesperado al actualizar.");
  }
}

// Eliminar mascota
async function eliminarMascota() {
  if (!confirm("¿Seguro que deseas eliminar esta mascota?")) return;

  try {
    const res = await fetch(`${API}/mascotas/${idMascotaActual}`, {
      method: "DELETE"
    });

    if (res.ok) {
      alert("✅ Mascota eliminada");
      window.location.href = "/administrador/mascotas.html";
    } else {
      const msg = await res.text();
      alert("❌ Error: " + msg);
    }
  } catch (error) {
    console.error("Error al eliminar:", error);
    alert("Error inesperado al eliminar.");
  }
}
