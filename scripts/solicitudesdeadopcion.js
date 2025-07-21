document.addEventListener('DOMContentLoaded', async () => {
  const container = document.querySelector('.cards-container');
  const token = localStorage.getItem('token'); // 🛡️ Token JWT del usuario

  if (!token) {
    container.innerHTML = '<p style="text-align:center">Debes iniciar sesión para ver tus solicitudes.</p>';
    return;
  }

  // 🎯 Obtener el ID del usuario desde el token
  const payload = JSON.parse(atob(token.split('.')[1]));
  const idUsuario = payload.id;

  try {
    const res = await fetch(`http://localhost:7070/solicitudes/${idUsuario}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const solicitudes = await res.json();

    if (!solicitudes.length) {
      container.innerHTML = '<p style="text-align:center">Aún no has solicitado ninguna adopción.</p>';
      return;
    }

    solicitudes.forEach(s => {
      const card = document.createElement('div');
      card.classList.add('pet-card');

      card.innerHTML = `
        <img src="${s.foto}" alt="${s.nombre}" class="pet-image">
        <div class="pet-info">
          <div class="pet-info-row">
            <span class="pet-info-label">Nombre:</span>
            <span class="pet-info-value">${s.nombre}</span>
          </div>
          <div class="pet-info-row">
            <span class="pet-info-label">Edad:</span>
            <span class="pet-info-value">${s.edad}</span>
          </div>
          <div class="pet-info-row">
            <span class="pet-info-label">Especie:</span>
            <span class="pet-info-value">${s.especie}</span>
          </div>
        </div>
        <div class="pet-buttons">
          <button class="btn btn-status">Estado: ${s.estado}</button>
        </div>
      `;

      container.appendChild(card);
    });

  } catch (err) {
    console.error('Error al cargar solicitudes:', err);
    container.innerHTML = '<p style="text-align:center">Hubo un error al mostrar tus solicitudes.</p>';
  }
});
