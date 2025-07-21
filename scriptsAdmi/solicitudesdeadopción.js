const API = "http://localhost:7070";

window.addEventListener("DOMContentLoaded", async () => {
  const tbody = document.getElementById("tbodySolicitudes");

  try {
    const res = await fetch(`${API}/admin/solicitudes-adopcion`);
    const solicitudes = await res.json();
    tbody.innerHTML = "";

    if (solicitudes.length === 0) {
      tbody.innerHTML = `
        <tr><td colspan="7">No hay solicitudes registradas.</td></tr>
      `;
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
        <td>${new Date(s.fecha).toLocaleDateString("es-MX")}</td>
        <td>${s.estado}</td>
        <td>
          <a href="/formularios/formulario.html?id=${s.id}">
            <button class="badge aprobado">Inspeccionar</button>
          </a>
        </td>
      `;

      tbody.appendChild(fila);
    });
  } catch (error) {
    console.error("Error al cargar solicitudes:", error);
    tbody.innerHTML = `
      <tr><td colspan="7">Error al conectar con el servidor.</td></tr>
    `;
  }
});
