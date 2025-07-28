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
        console.log('Solicitudes cargadas:', solicitudes);
        
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
            
            // Obtener el ID correcto (probamos varios posibles campos)
            const solicitudId = solicitud.id || solicitud.solicitudId || solicitud.ID || solicitud._id;
            console.log(`ID obtenido para solicitud ${i}:`, solicitudId);
            
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
                    <button class="btn-aprobar" onclick="cambiarEstado(${solicitudId}, 'aprobada', ${i})" style="background-color: #10b981; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; margin-right: 5px;" ${solicitud.estadoSolicitud !== 'pendiente' ? 'disabled' : ''}>
                        Aprobar
                    </button>
                    <button class="btn-rechazar" onclick="cambiarEstado(${solicitudId}, 'rechazada', ${i})" style="background-color: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;" ${solicitud.estadoSolicitud !== 'pendiente' ? 'disabled' : ''}>
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

// Función para ver detalle de solicitud
function verDetalle(index) {
    const solicitud = window.solicitudesData[index];
    
    // Guardar los datos de la solicitud en localStorage para que los pueda usar la página de detalle
    localStorage.setItem('solicitudDetalle', JSON.stringify(solicitud));
    
    // Navegar a la página de detalle
    window.location.href = '../solicitudAdopcion/Solicitud_adopcion.html';
}

// Función para cambiar estado de solicitud (versión corregida)
async function cambiarEstado(solicitudId, nuevoEstado, index) {
    // Validaciones iniciales
    if (!solicitudId || isNaN(solicitudId)) {
        console.error('ID inválido:', solicitudId);
        alert('Error: ID de solicitud no válido o faltante');
        return;
    }
    
    if (!confirm(`¿Está seguro de ${nuevoEstado === 'aprobada' ? 'aprobar' : 'rechazar'} esta solicitud?`)) {
        return;
    }
    
    try {
        // Convertir a número (por si viene como string)
        const idNumerico = Number(solicitudId);
        
        console.log(`[DEBUG] Enviando PUT a: ${API_URL}/${idNumerico}`);
        console.log(`[DEBUG] ID numérico enviado:`, idNumerico);
        
        const response = await fetch(`${API_URL}/${idNumerico}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                estadoSolicitud: nuevoEstado
            })
        });
        
        console.log(`[DEBUG] Respuesta del servidor: ${response.status}`);
        
        if (response.ok) {
            alert(`Solicitud ${nuevoEstado} correctamente`);
            // Actualizar el estado en los datos locales
            if (window.solicitudesData && window.solicitudesData[index]) {
                window.solicitudesData[index].estadoSolicitud = nuevoEstado;
            }
            cargarSolicitudes(); // Recargar la tabla
        } else {
            const errorData = await response.json();
            console.error('[DEBUG] Error detallado:', errorData);
            
            // Mensaje más amigable para el usuario
            let mensajeError = 'Error al actualizar el estado';
            if (errorData.error) {
                mensajeError += `: ${errorData.error}`;
            }
            
            throw new Error(mensajeError);
        }
        
    } catch (error) {
        console.error('Error al cambiar estado:', error);
        alert(error.message);
    }
}

// Función alternativa si el backend espera el ID en el body
async function cambiarEstadoAlternativo(solicitudId, nuevoEstado, index) {
    try {
        const response = await fetch(API_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: Number(solicitudId),
                estadoSolicitud: nuevoEstado
            })
        });
        
        // Resto del código igual que en cambiarEstado()
    } catch (error) {
        console.error('Error en método alternativo:', error);
        alert('Error al actualizar (método alternativo)');
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