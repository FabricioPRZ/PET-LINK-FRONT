// ✅ Verifica si el usuario tiene rol administrador
function esAdministrador() {
  // Puedes adaptar esta lógica si usas sesiones o tokens
  return localStorage.getItem('rol') === 'admin';
}

// 📅 Formatear fecha en formato amigable
function formatearFecha(fechaStr) {
  const fecha = new Date(fechaStr);
  return fecha.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// 🐶 Crear una tarjeta visual con los datos de la solicitud
function crearTarjeta(solicitud) {
  const tarjeta = document.createElement('div');
  tarjeta.classList.add('card-solicitud');

  tarjeta.innerHTML = `
    <h2>${solicitud.nombreMascota}</h2>
    <p><strong>Usuario:</strong> ${solicitud.usuario}</p>
    <p><strong>Especie:</strong> ${solicitud.especie}</p>
    <p><strong>Fecha de solicitud:</strong> ${formatearFecha(solicitud.fecha)}</p>
    <p><strong>Estatus:</strong> ${solicitud.estatus}</p>
    <p><strong>Estado:</strong> ${solicitud.estado}</p>
  `;

  return tarjeta;
}

// 📦 Cargar solicitudes desde el servidor y mostrarlas en pantalla
async function cargarSolicitudes() {
  try {
    const response = await fetch('/api/solicitudes', {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token') // Si estás usando JWT
      }
    });

    if (!response.ok) throw new Error('No se pudieron obtener las solicitudes');

    const solicitudes = await response.json();
    const container = document.querySelector('.cards-container');
    container.innerHTML = ''; // Limpia tarjetas anteriores

    solicitudes.forEach(solicitud => {
      const tarjeta = crearTarjeta(solicitud);
      container.appendChild(tarjeta);
    });
  } catch (error) {
    console.error('Error al cargar solicitudes:', error);
    alert('Hubo un problema al mostrar las solicitudes.');
  }
}

// 🚀 Ejecuta al cargar la vista, solo si es admin
document.addEventListener('DOMContentLoaded', () => {
  if (esAdministrador()) {
    cargarSolicitudes();
  } else {
    alert('Acceso denegado. Esta sección es solo para administradores.');
    window.location.href = '/acceso-denegado';
  }
});
