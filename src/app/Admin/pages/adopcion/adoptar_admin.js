const API_BASE_URL = 'http://44.208.231.53:7078';

// Variables globales
let mascotas = [];
let currentPetId = null;

// Función para obtener URL completa de la imagen
function getFullImageUrl(path) {
    if (!path) return '/src/public/img/default-pet.jpg';
    if (path.startsWith('http')) return path;
    return `${API_BASE_URL}${path}`;
}

// Obtener todas las mascotas
async function obtenerMascotas() {
    try {
        const response = await fetch(`${API_BASE_URL}/mascotas`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Error al obtener las mascotas');
        }
        mascotas = await response.json();
        return mascotas;
    } catch (error) {
        console.error('Error al obtener mascotas:', error);
        mostrarError('No se pudieron cargar las mascotas. Por favor, inténtalo de nuevo más tarde.');
        return [];
    }
}

// Mostrar mensaje de error
function mostrarError(mensaje) {
    const container = document.getElementById('pets-container');
    container.innerHTML = `<div class="error-message">${mensaje}</div>`;
}

// Mostrar mascotas en el contenedor
function mostrarMascotas(mascotasFiltradas) {
    const container = document.getElementById('pets-container');
    container.innerHTML = '';

    const mascotasEnProceso = mascotasFiltradas.filter(mascota => mascota.estado === 'en_proceso');

    if (mascotasEnProceso.length === 0) {
        container.innerHTML = '<p class="no-results">No se encontraron mascotas en proceso con los filtros seleccionados.</p>';
        return;
    }

    mascotasEnProceso.forEach(mascota => {
        const petCard = document.createElement('div');
        petCard.className = 'pet-card';

        const primeraImagen = mascota.fotos_mascota?.[0]?.foto_url || mascota.fotos_mascota?.[0];
        const imagenUrl = getFullImageUrl(primeraImagen);

        petCard.innerHTML = `
            <img src="${imagenUrl}" alt="${mascota.nombre}" class="pet-image"
                 onerror="this.onerror=null;this.src='/src/public/img/default-pet.jpg'">
            <div class="pet-info">
                <div class="pet-info-row">
                    <span class="pet-info-label">Nombre:</span>
                    <span class="pet-info-value">${mascota.nombre || 'No especificado'}</span>
                </div>
                <div class="pet-info-row">
                    <span class="pet-info-label">Especie:</span>
                    <span class="pet-info-value">${mascota.especie || 'No especificado'}</span>
                </div>
                <div class="pet-info-row">
                    <span class="pet-info-label">Tamaño:</span>
                    <span class="pet-info-value">${mascota.tamaño || 'No especificado'}</span>
                </div>
                <div class="pet-info-row">
                    <span class="pet-info-label">Sexo:</span>
                    <span class="pet-info-value">${mascota.sexo === 'macho' ? 'Macho' : 'Hembra'}</span>
                </div>
            </div>
            <div class="pet-buttons">
                <button class="btn btn-status edit-btn" data-id="${mascota.id}">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-status-eliminar delete-btn" data-id="${mascota.id}">
                    <i class="fas fa-trash-alt"></i> Eliminar
                </button>
            </div>
        `;

        container.appendChild(petCard);
    });

    // Agregar event listeners a los botones
    agregarEventListeners();
}

// Aplicar filtros a las mascotas
function aplicarFiltros() {
    const especie = document.getElementById('especie-filter').value.toLowerCase();
    const tamano = document.getElementById('tamano-filter').value.toLowerCase();
    const sexo = document.getElementById('sexo-filter').value.toLowerCase();

    const mascotasFiltradas = mascotas.filter(mascota => {
        return (especie === '' || (mascota.especie && mascota.especie.toLowerCase().includes(especie))) &&
               (tamano === '' || (mascota.tamaño && mascota.tamaño.toLowerCase().includes(tamano))) &&
               (sexo === '' || (mascota.sexo && mascota.sexo.toLowerCase().includes(sexo)));
    });

    mostrarMascotas(mascotasFiltradas);
}

// Agregar event listeners a los botones de editar/eliminar
function agregarEventListeners() {
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const petId = e.currentTarget.getAttribute('data-id');
            abrirModalEdicion(petId);
        });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const petId = e.currentTarget.getAttribute('data-id');
            abrirModalConfirmacionEliminar(petId);
        });
    });
}

// Modal de edición
function abrirModalEdicion(petId) {
    currentPetId = petId;
    const mascota = mascotas.find(m => m.id == petId);
    
    if (mascota) {
        document.getElementById('petId').value = mascota.id;
        document.getElementById('editNombre').value = mascota.nombre || '';
        document.getElementById('editEspecie').value = mascota.especie || 'Perro';
        document.getElementById('editTamano').value = mascota.tamaño || 'Mediano';
        document.getElementById('editSexo').value = mascota.sexo || 'macho';
        document.getElementById('editDescripcion').value = mascota.descripcion || '';
        document.getElementById('editEstado').value = mascota.estado || 'en_proceso';
        
        document.getElementById('editModal').style.display = 'block';
    }
}

// Modal de confirmación de eliminación
function abrirModalConfirmacionEliminar(petId) {
    currentPetId = petId;
    document.getElementById('deleteModal').style.display = 'block';
}

// Cerrar modales
function cerrarModales() {
    document.getElementById('editModal').style.display = 'none';
    document.getElementById('deleteModal').style.display = 'none';
    // Limpiar el input de archivo al cerrar el modal
    document.getElementById('editImagen').value = '';
}

// Actualizar una mascota usando FormData
async function actualizarMascota(petId, formData) {
    try {
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${API_BASE_URL}/mascotas/${petId}`, {
            method: 'PUT',
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` })
                // No establecer Content-Type, el navegador lo hará automáticamente
            },
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Error al actualizar la mascota');
        }

        return await response.json();
    } catch (error) {
        console.error('Error al actualizar mascota:', error);
        throw error;
    }
}

// Eliminar una mascota
async function eliminarMascota(petId) {
    try {
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${API_BASE_URL}/mascotas/${petId}`, {
            method: 'DELETE',
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` })
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Error al eliminar la mascota');
        }

        return true;
    } catch (error) {
        console.error('Error al eliminar mascota:', error);
        throw error;
    }
}

// Mostrar loader
function mostrarLoader(container) {
    const loader = document.createElement('div');
    loader.className = 'loader';
    container.appendChild(loader);
    return loader;
}

// Inicializar la aplicación
async function init() {
    try {
        // Cargar mascotas al inicio
        await obtenerMascotas();
        aplicarFiltros();
        
        // Configurar eventos de filtros
        document.getElementById('filter-button').addEventListener('click', aplicarFiltros);
        document.querySelectorAll('.styled-select').forEach(select => {
            select.addEventListener('change', aplicarFiltros);
        });

        // Configurar eventos de modales
        document.querySelectorAll('.close').forEach(span => {
            span.addEventListener('click', cerrarModales);
        });

        window.addEventListener('click', (event) => {
            if (event.target === document.getElementById('editModal') || 
                event.target === document.getElementById('deleteModal')) {
                cerrarModales();
            }
        });

        document.getElementById('cancelEdit').addEventListener('click', cerrarModales);
        document.getElementById('cancelDelete').addEventListener('click', cerrarModales);

        // Formulario de edición
        document.getElementById('editPetForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const modalContent = document.getElementById('editModal').querySelector('.modal-content');
            const loader = mostrarLoader(modalContent);
            
            try {
                const formData = new FormData();
                
                // Agregar todos los campos al FormData
                formData.append('nombre', document.getElementById('editNombre').value);
                formData.append('especie', document.getElementById('editEspecie').value);
                formData.append('tamaño', document.getElementById('editTamano').value);
                formData.append('sexo', document.getElementById('editSexo').value);
                formData.append('descripcion', document.getElementById('editDescripcion').value);
                formData.append('estado', document.getElementById('editEstado').value);
                
                // Agregar la imagen si se seleccionó una
                const imagenInput = document.getElementById('editImagen');
                if (imagenInput.files.length > 0) {
                    formData.append('imagen', imagenInput.files[0]);
                }
                
                await actualizarMascota(currentPetId, formData);
                
                // Recargar mascotas
                await obtenerMascotas();
                aplicarFiltros();
                
                cerrarModales();
                alert('Mascota actualizada correctamente');
            } catch (error) {
                alert(`Error: ${error.message}`);
            } finally {
                loader.remove();
            }
        });

        // Confirmar eliminación
        document.getElementById('confirmDelete').addEventListener('click', async () => {
            const modalContent = document.getElementById('deleteModal').querySelector('.modal-content');
            const loader = mostrarLoader(modalContent);
            
            try {
                await eliminarMascota(currentPetId);
                
                // Recargar mascotas
                await obtenerMascotas();
                aplicarFiltros();
                
                cerrarModales();
                alert('Mascota eliminada correctamente');
            } catch (error) {
                alert(`Error: ${error.message}`);
            } finally {
                loader.remove();
            }
        });

    } catch (error) {
        console.error('Error al inicializar la aplicación:', error);
        mostrarError('Ocurrió un error al cargar la aplicación. Por favor, recarga la página.');
    }
}

document.addEventListener('DOMContentLoaded', init);