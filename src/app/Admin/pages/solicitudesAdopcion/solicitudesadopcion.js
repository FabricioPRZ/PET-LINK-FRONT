// solicitudesadopcion.js

// URL del endpoint
const API_URL = 'http://44.208.231.53:7078/solicitudes-adopcion';

// Función para formatear fecha
function formatearFecha(timestamp) {
    const fecha = new Date(timestamp);
    return fecha.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Función para obtener el color del estado
function getEstadoColor(estado) {
    switch(estado.toLowerCase()) {
        case 'pendiente':
            return '#fbbf24'; // amarillo
        case 'aprobada':
            return '#10b981'; // verde
        case 'rechazada':
            return '#ef4444'; // rojo
        default:
            return '#6b7280'; // gris
    }
}

// Función para obtener nombre de mascota
async function obtenerNombreMascota(mascotaId) {
    try {
        const response = await fetch(`http://44.208.231.53:7078/mascotas/${mascotaId}`);
        if (response.ok) {
            const mascota = await response.json();
            return `${mascota.nombre} (${mascota.especie})`;
        }
    } catch (error) {
        console.error('Error al obtener mascota:', error);
    }
    return `Mascota ID: ${mascotaId}`;
}

// Función para cargar las solicitudes
async function cargarSolicitudes() {
    const tbody = document.getElementById('tbodySolicitudes');
    
    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const solicitudes = await response.json();
        
        // Limpiar tabla
        tbody.innerHTML = '';
        
        if (solicitudes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7">No hay solicitudes de adopción</td></tr>';
            return;
        }
        
        // Generar filas de la tabla
        for (let i = 0; i < solicitudes.length; i++) {
            const solicitud = solicitudes[i];
            const fila = document.createElement('tr');
            
            // Construir nombre completo
            const nombreCompleto = `${solicitud.nombre} ${solicitud.apellidoPaterno} ${solicitud.apellidoMaterno}`;
            
            // Obtener información de la mascota
            const especieMascota = await obtenerNombreMascota(solicitud.mascotaId);
            
            fila.innerHTML = `
                <td>${i + 1}</td>
                <td>${solicitud.correo}</td>
                <td>${nombreCompleto}</td>
                <td>${especieMascota}</td>
                <td>${formatearFecha(solicitud.fechaSolicitud)}</td>
                <td>
                    <span class="estado-badge" style="background-color: ${getEstadoColor(solicitud.estadoSolicitud)}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                        ${solicitud.estadoSolicitud.toUpperCase()}
                    </span>
                </td>
                <td>
                    <button class="btn-ver" onclick="verDetalle(${i})" style="background-color: #3b82f6; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; margin-right: 5px;">
                        Ver
                    </button>
                    <button class="btn-aprobar" onclick="cambiarEstado(${solicitud.adoptanteId}, ${solicitud.mascotaId}, 'aprobada')" style="background-color: #10b981; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; margin-right: 5px;" ${solicitud.estadoSolicitud !== 'pendiente' ? 'disabled' : ''}>
                        Aprobar
                    </button>
                    <button class="btn-rechazar" onclick="cambiarEstado(${solicitud.adoptanteId}, ${solicitud.mascotaId}, 'rechazada')" style="background-color: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;" ${solicitud.estadoSolicitud !== 'pendiente' ? 'disabled' : ''}>
                        Rechazar
                    </button>
                </td>
            `;
            
            tbody.appendChild(fila);
        }
        
        // Guardar solicitudes globalmente para uso en funciones
        window.solicitudesData = solicitudes;
        
    } catch (error) {
        console.error('Error al cargar solicitudes:', error);
        tbody.innerHTML = '<tr><td colspan="7">Error al cargar las solicitudes</td></tr>';
    }
}

// Función ACTUALIZADA para ver detalle de solicitud
function verDetalle(index) {
    const solicitud = window.solicitudesData[index];
    
    // Guardar los datos de la solicitud en localStorage para que los pueda usar la página de detalle
    localStorage.setItem('solicitudDetalle', JSON.stringify(solicitud));
    
    // Navegar a la página de detalle
    window.location.href = '../solicitudAdopcion/Solicitud_adopcion.html';
}

// Función para cambiar estado de solicitud
async function cambiarEstado(adoptanteId, mascotaId, nuevoEstado) {
    if (!confirm(`¿Está seguro de ${nuevoEstado === 'aprobada' ? 'aprobar' : 'rechazar'} esta solicitud?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/${adoptanteId}/${mascotaId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                estadoSolicitud: nuevoEstado
            })
        });
        
        if (response.ok) {
            alert(`Solicitud ${nuevoEstado} correctamente`);
            cargarSolicitudes(); // Recargar la tabla
        } else {
            throw new Error('Error al actualizar el estado');
        }
        
    } catch (error) {
        console.error('Error al cambiar estado:', error);
        alert('Error al actualizar el estado de la solicitud');
    }
}

// Cargar solicitudes cuando se carga la página
document.addEventListener('DOMContentLoaded', cargarSolicitudes);

// Función para recargar manualmente
function recargarSolicitudes() {
    cargarSolicitudes();
}

// Agregar botón de recarga (opcional)
document.addEventListener('DOMContentLoaded', () => {
    const main = document.querySelector('main');
    if (main) {
        const botonRecarga = document.createElement('button');
        botonRecarga.textContent = 'Recargar solicitudes';
        botonRecarga.style.cssText = 'background-color: #6366f1; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-bottom: 20px;';
        botonRecarga.onclick = recargarSolicitudes;
        
        const tableContainer = main.querySelector('.table-container');
        if (tableContainer) {
            main.insertBefore(botonRecarga, tableContainer);
        }
    }
});