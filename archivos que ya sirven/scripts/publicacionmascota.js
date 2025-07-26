const API = "http://localhost:7070";

// 🔄 Carga automática de la publicación inicial (ejemplo con ID = URL ?id=7)
window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const idPublicacion = parseInt(params.get("id"));

  if (!idPublicacion || isNaN(idPublicacion)) {
    alert("La URL no contiene un ID válido de publicación.");
    return;
  }

  cargarMascotaDesdePublicacion(idPublicacion);
});

// Función principal que carga una mascota desde la publicación
async function cargarMascotaDesdePublicacion(idPublicacion) {
  try {
    // 1. Obtener publicación
    const pubRes = await fetch(`${API}/publicaciones/${idPublicacion}`);
    if (!pubRes.ok) {
      const msg = await pubRes.text();
      alert("Error al obtener publicación: " + msg);
      return;
    }
    const publicacion = await pubRes.json();

    // 2. Obtener mascota
    const mascotaRes = await fetch(`${API}/mascotas/${publicacion.Codigo}`);
    if (!mascotaRes.ok) {
      const msg = await mascotaRes.text();
      alert("Error al obtener mascota: " + msg);
      return;
    }
    const mascota = await mascotaRes.json();

    // 3. Obtener especie
    const especieRes = await fetch(`${API}/especies/${mascota.codigo_especie}`);
    const especie = especieRes.ok ? await especieRes.json() : { nombre: "—" };

    // 4. Obtener tamaño
    const tamanoRes = await fetch(`${API}/tamanos/${mascota.codigo_tamaño}`);
    const tamano = tamanoRes.ok ? await tamanoRes.json() : { descripcion: "—" };

    // 5. Obtener solicitud para fotos
    const solicitudRes = await fetch(`${API}/solicitudes-cedente/${publicacion.codigo_solicitudCedente}`);
    const solicitud = solicitudRes.ok ? await solicitudRes.json() : { fotos_mascotas: "" };

    // 6. Obtener vacunas aplicadas
    const aplicacionesRes = await fetch(`${API}/mascotas-vacunas`);
    const aplicaciones = aplicacionesRes.ok ? await aplicacionesRes.json() : [];

    const vacunasAplicadas = aplicaciones.filter(app => app.codigo_mascota === mascota.id_mascotas);

    // 7. Obtener nombres de vacunas
    const listaVacunas = [];
    for (const app of vacunasAplicadas) {
      const vacunaRes = await fetch(`${API}/vacunas/${app.codigo_vacuna}`);
      if (vacunaRes.ok) {
        const vacuna = await vacunaRes.json();
        listaVacunas.push(vacuna.nombreVacuna);
      }
    }

    // 8. Mostrar en vista
    renderizarMascota({
      mascota,
      especie,
      tamano,
      fotos: solicitud.fotos_mascotas,
      vacunas: listaVacunas
    });

  } catch (error) {
    console.error("Error al cargar la publicación:", error);
    alert("Ocurrió un error inesperado al cargar los datos.");
  }
}

// Función para mostrar los datos en el HTML
function renderizarMascota({ mascota, especie, tamano, fotos, vacunas }) {
  document.getElementById("nombreMascota").textContent = mascota.nombre_mascotas || "—";
  document.getElementById("especieMascota").textContent = especie.nombre || "—";
  document.getElementById("sexoMascota").textContent = mascota.sexo || "—";
  document.getElementById("tamanoMascota").textContent = tamano.descripcion || "—";
  document.getElementById("pesoMascota").textContent = mascota.peso ? `${mascota.peso} kg` : "—";
  document.getElementById("esterilizado").textContent = mascota.esterilizado || "—";
  document.getElementById("desparasitado").textContent = mascota.desparasitado || "—";
  document.getElementById("discapacitado").textContent = mascota.discapacitado || "Ninguna";
  document.getElementById("enfermedades").textContent = mascota.enfermedades || "Ninguna";
  document.getElementById("descripcionMascota").textContent = mascota.descripcion || "—";

  // 🖼️ Reemplazar imágenes
  const imagenes = fotos ? fotos.split(",") : [];
  const mainImg = document.getElementById("imagenPrincipal");
  const thumbs = document.getElementById("imagenesMiniatura");

  mainImg.src = imagenes[0] || "/mascotas/default.jpg";
  thumbs.innerHTML = "";

  for (let i = 1; i < imagenes.length; i++) {
    const img = document.createElement("img");
    img.src = imagenes[i];
    thumbs.appendChild(img);
  }

  // 💉 Reemplazar vacunas
  const lista = document.getElementById("listaVacunas");
  lista.innerHTML = "";

  if (vacunas.length > 0) {
    for (const nombre of vacunas) {
      const li = document.createElement("li");
      li.textContent = nombre;
      lista.appendChild(li);
    }
  } else {
    const li = document.createElement("li");
    li.textContent = "—";
    lista.appendChild(li);
  }
}
