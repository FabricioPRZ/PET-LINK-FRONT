document.addEventListener('DOMContentLoaded', async () => {
  const container = document.querySelector('.cards-container');
  const token = localStorage.getItem('token');

  // 🔐 Validación: ¿Está logueado?
  if (!token) {
    container.innerHTML = '<p style="text-align:center">Debes iniciar sesión para ver tus registros.</p>';
    return;
  }

  // 🧠 Extraer ID del usuario desde el token
  const payload = JSON.parse(atob(token.split('.')[1]));
  const idUsuario = payload.id;

  try {
    // 📡 Solicitar los registros del usuario
    const res = await fetch(`http://localhost:7070/registro-mascotas/${idUsuario}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const registros = await res.json();

    if (!registros.length) {
      container.innerHTML = '<p style="text-align:center">Aún no has registrado mascotas.</p>';
      return;
    }

    // 🧱 Renderizar cada tarjeta
    registros.forEach(m => {
      const card = document.createElement('div');
      card.classList.add('pet-card');

      card.innerHTML = `
        <img src="${m.fotos_mascotas}" alt="Mascota registrada" class="pet-image">
        <div class="pet-info">
          <div class="pet-info-row">
            <span class="pet-info-label">Registro:</span>
            <span class="pet-info-value">#${m.id_solicitudCedente}</span>
          </div>
          <div class="pet-info-row">
            <span class="pet-info-label">Fecha:</span>
            <span class="pet-info-value">${m.fecha_solicitudCedente}</span>
          </div>
        </div>
        <div class="pet-buttons">
          <button class="btn btn-status">Estado: ${m.estado_solicitudCedente}</button>
        </div>
      `;

      container.appendChild(card);
    });

  } catch (error) {
    console.error('Error al cargar solicitudes:', error);
    container.innerHTML = '<p style="text-align:center">Error al mostrar tus registros. Intenta más tarde.</p>';
  }
});
