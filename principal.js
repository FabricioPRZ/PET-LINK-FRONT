document.addEventListener('DOMContentLoaded', async () => {
  const container = document.querySelector('.cards-container');
  const leftArrow = document.querySelector('.nav-arrow.left');
  const rightArrow = document.querySelector('.nav-arrow.right');

  try {
    // 🔗 Cargar mascotas desde el backend
    const res = await fetch('http://localhost:7070/mascotas'); // ajusta el puerto si usas otro
    const mascotas = await res.json();

    // 🧱 Insertar cada tarjeta de mascota
    mascotas.forEach(m => {
      const card = document.createElement('div');
      card.classList.add('pet-card');

      card.innerHTML = `
        <img src="${m.foto}" alt="${m.nombre}" class="pet-image">
        <div class="pet-info">
          <div class="pet-info-row">
            <span class="pet-info-label">Nombre:</span>
            <span class="pet-info-value">${m.nombre}</span>
          </div>
          <div class="pet-info-row">
            <span class="pet-info-label">Edad:</span>
            <span class="pet-info-value">${m.edad}</span>
          </div>
          <div class="pet-info-row">
            <span class="pet-info-label">Especie:</span>
            <span class="pet-info-value">${m.especie}</span>
          </div>
        </div>
        <div class="pet-buttons">
          <button class="btn btn-info" onclick="verDetalles(${m.id_mascota})">Ver más</button>
          <button class="btn btn-adopt" onclick="adoptarMascota(${m.id_publicacion})">Adoptar</button>
        </div>
      `;

      container.appendChild(card);
    });

  } catch (err) {
    console.error('Error al cargar mascotas:', err);
  }

  // 🎯 Funcionalidad para navegar con flechas
  leftArrow.addEventListener('click', () => {
    container.scrollBy({ left: -220, behavior: 'smooth' });
  });

  rightArrow.addEventListener('click', () => {
    container.scrollBy({ left: 220, behavior: 'smooth' });
  });
});

// 🔍 Funciones para redirección
function verDetalles(id) {
  window.location.href = `/pages/mascota.html?id=${id}`;
}

function adoptarMascota(idPublicacion) {
  window.location.href = `/pages/adopcion.html?id=${idPublicacion}`;
}
