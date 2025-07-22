const API = "http://localhost:7070"; 


function esAdministrador() {
  return localStorage.getItem("rol") === "admin";
}


function formatearFecha(fechaStr) {
  const fecha = new Date(fechaStr);
  return fecha.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

async function cargarSolicitudes() {
  const tbody = document.getElementById("tbodySolicitudes");

  try {
    const res = await fetch(`${API}/api/solicitudes`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token")
      }
    });

    if (!res.ok) throw new Error("No se pudieron obtener las solicitudes");

    const solicitudes = await res.json();
    tbody.innerHTML = "";

    if (solicitudes.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7">No hay solicitudes registradas.</td></tr>`;
      return;
    }

    solicitudes.forEach((s, i) => {
      const fila = document.createElement("tr");
      fila.className = i % 2 === 0 ? "row-even" : "row-odd";

      fila.innerHTML = `
        <td>${i + 1}</td>
        <td>${s.nombreUsuario}</td>
        <td>${s.nombreMascota}</td>
        <td>${s.especie}</td>
        <td>${formatearFecha(s.fecha)}</td>
        <td>${s.estado}</td>
        <td>
          <a href="/formularios/formulario_registro.html?id=${s.id}">
            <button class="badge pendiente">Revisar</button>
          </a>
        </td>
      `;

      tbody.appendChild(fila);
    });
  } catch (error) {
    console.error("Error al cargar solicitudes:", error);
    tbody.innerHTML = `<tr><td colspan="7">Error al conectar con el servidor.</td></tr>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (esAdministrador()) {
    cargarSolicitudes();
  } else {
    alert("Acceso denegado. Esta sección es solo para administradores.");
    window.location.href = "/acceso-denegado";
  }
});
