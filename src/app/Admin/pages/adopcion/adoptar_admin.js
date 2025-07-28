const API_BASE_URL = 'http://44.208.231.53:7078';

function getFullImageUrl(path) {
    if (!path) return '/src/public/img/default-pet.jpg';
    if (path.startsWith('http')) return path;
    return `${API_BASE_URL}${path}`;
}

async function obtenerMascotas() {
    try {
        const response = await fetch(`${API_BASE_URL}/mascotas`);
        if (!response.ok) {
            throw new Error('Error al obtener las mascotas');
        }
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        mostrarError('No se pudieron cargar las mascotas');
        return [];
    }
}

// Función para mostrar error
function mostrarError(mensaje) {
    const container = document.getElementById('pets-container');
    container.innerHTML = `<div class="error-message">${mensaje}</div>`;
}

function mostrarMascotas(mascotasFiltradas) {
    const container = document.getElementById('pets-container');
    container.innerHTML = '';

    const mascotasEnProceso = mascotasFiltradas.filter(mascota => mascota.estado === 'en_proceso');

    if (mascotasEnProceso.length === 0) {
        container.innerHTML = '<p>No se encontraron mascotas en proceso con los filtros seleccionados.</p>';
        return;
    }

    mascotasEnProceso.forEach(mascota => {
        const petCard = document.createElement('div');
        petCard.className = 'pet-card';

        // Obtener la primera imagen o usar una por defecto
        const primeraImagen = mascota.fotos_mascota?.[0];
        const imagenUrl = getFullImageUrl(primeraImagen);

        petCard.innerHTML = `
            <img src="${imagenUrl}" alt="${mascota.nombre}" class="pet-image"
                 onerror="this.onerror=null;this.src='/src/public/img/default-pet.jpg'">
            <div class="pet-info">
                <div class="pet-info-row">
                    <span class="pet-info-label">Nombre:</span>
                    <span class="pet-info-value">${mascota.nombre}</span>
                </div>
                <div class="pet-info-row">
                    <span class="pet-info-label">Especie:</span>
                    <span class="pet-info-value">${mascota.especie}</span>
                </div>
                <div class="pet-info-row">
                    <span class="pet-info-label">Tamaño:</span>
                    <span class="pet-info-value">${mascota.tamaño}</span>
                </div>
                <div class="pet-info-row">
                    <span class="pet-info-label">Sexo:</span>
                    <span class="pet-info-value">${mascota.sexo === 'macho' ? 'Macho' : 'Hembra'}</span>
                </div>
            </div>
            <div class="pet-buttons">
                <button class="btn btn-status">Editar</button>
                <button class="btn btn-status-eliminar">Eliminar</button>
            </div>
        `;

        container.appendChild(petCard);
    });
}

// Función para aplicar filtros
function aplicarFiltros(mascotas) {
    const especie = document.getElementById('especie-filter').value.toLowerCase();
    const tamano = document.getElementById('tamano-filter').value.toLowerCase();
    const sexo = document.getElementById('sexo-filter').value.toLowerCase();

    const mascotasFiltradas = mascotas.filter(mascota => {
        return (especie === '' || mascota.especie.toLowerCase().includes(especie)) &&
               (tamano === '' || mascota.tamaño.toLowerCase().includes(tamano)) &&
               (sexo === '' || mascota.sexo.toLowerCase().includes(sexo));
    });

    mostrarMascotas(mascotasFiltradas);
}

// Cargar mascotas al inicio
document.addEventListener('DOMContentLoaded', async () => {
    const mascotas = await obtenerMascotas();
    
    if (mascotas.length > 0) {
        aplicarFiltros(mascotas);
        
        // Configurar evento del botón de filtro
        document.getElementById('filter-button').addEventListener('click', () => aplicarFiltros(mascotas));
        
        // También puedes aplicar filtros al cambiar cualquier select
        document.querySelectorAll('.styled-select').forEach(select => {
            select.addEventListener('change', () => aplicarFiltros(mascotas));
        });
    }
});