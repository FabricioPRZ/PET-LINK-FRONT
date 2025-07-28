// solicitud_adopcion.js

// Función para formatear fecha
function formatearFecha(timestamp) {
    const fecha = new Date(timestamp);
    return fecha.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Función para obtener nombre de mascota (si tienes endpoint para mascotas)
async function obtenerNombreMascota(mascotaId) {
    try {
        // Ajusta esta URL según tu API
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

// Función para cargar datos de la solicitud
async function cargarDatosSolicitud() {
    // Obtener datos del localStorage
    const solicitudData = localStorage.getItem('solicitudDetalle');
    
    if (!solicitudData) {
        alert('No se encontraron datos de la solicitud');
        window.location.href = 'solicitudesdeadopcion.html'; // Regresar a la lista
        return;
    }
    
    const solicitud = JSON.parse(solicitudData);
    
    try {
        // Obtener nombre de mascota
        const nombreMascota = await obtenerNombreMascota(solicitud.mascotaId);
        
        // Llenar información básica
        const infoContainer = document.querySelector('.solicitud-info');
        infoContainer.innerHTML = `
            <p><strong>ID Solicitud:</strong> ${solicitud.adoptanteId}-${solicitud.mascotaId}</p>
            <p><strong>Adoptante:</strong> ${solicitud.nombre} ${solicitud.apellidoPaterno} ${solicitud.apellidoMaterno}</p>
            <p><strong>Mascota:</strong> ${nombreMascota}</p>
            <p><strong>Fecha Solicitud:</strong> ${formatearFecha(solicitud.fechaSolicitud)}</p>
            <p><strong>Estado:</strong> <span style="color: ${getEstadoColor(solicitud.estadoSolicitud)}; font-weight: bold;">${solicitud.estadoSolicitud.toUpperCase()}</span></p>
        `;
        
        // Llenar formulario con datos
        llenarFormulario(solicitud);
        
    } catch (error) {
        console.error('Error al cargar datos:', error);
        alert('Error al cargar los datos de la solicitud');
    }
}

// Función para obtener color del estado
function getEstadoColor(estado) {
    switch(estado.toLowerCase()) {
        case 'pendiente': return '#fbbf24';
        case 'aprobada': return '#10b981';
        case 'rechazada': return '#ef4444';
        default: return '#6b7280';
    }
}

// Función para llenar el formulario con los datos
function llenarFormulario(solicitud) {
    // Datos personales
    fillFieldByLabel('Nombre (s):', solicitud.nombre);
    fillFieldByLabel('Apellido paterno:', solicitud.apellidoPaterno);
    fillFieldByLabel('Apellido materno:', solicitud.apellidoMaterno);
    fillFieldByLabel('Edad:', solicitud.edad);
    fillFieldByLabel('Ocupación:', solicitud.ocupacion);
    fillFieldByLabel('¿Con cuantas personas vives?', solicitud.personasVivienda);
    fillFieldByLabel('Correo electrónico:', solicitud.correo);
    
    // Selects
    fillSelectByLabel('¿Permiten mascotas en la vivienda?:', solicitud.permiteMascotas === 'si' ? 'Sí' : 'No');
    fillSelectByLabel('¿Hay niños en casa?', solicitud.hayNinos === 'si' ? 'Sí' : 'No');
    fillSelectByLabel('¿En que tipo de vivienda reside?', capitalizar(solicitud.tipoVivienda));
    fillSelectByLabel('¿La vivienda es propia o renta?', capitalizar(solicitud.tipoPropiedad));
    fillSelectByLabel('¿Ha tenido mascotas Antes?', solicitud.experiencia === 'si' ? 'Sí' : 'No');
    
    // Textarea
    fillTextAreaByLabel('¿Qué paso con ellas?', solicitud.historialMascotas);
    
    // Mostrar documentos
    mostrarDocumentos(solicitud);
    
    // Configurar botones
    configurarBotones(solicitud);
}

// Función auxiliar para llenar campos por etiqueta
function fillFieldByLabel(labelText, value) {
    const labels = document.querySelectorAll('label');
    for (let label of labels) {
        if (label.textContent.includes(labelText)) {
            const input = label.parentElement.querySelector('input');
            if (input) {
                input.value = value || '';
                input.style.backgroundColor = '#f0f8ff';
                input.readOnly = true;
            }
            break;
        }
    }
}

// Función auxiliar para llenar selects por etiqueta
function fillSelectByLabel(labelText, value) {
    const labels = document.querySelectorAll('label');
    for (let label of labels) {
        if (label.textContent.includes(labelText)) {
            const select = label.parentElement.querySelector('select');
            if (select && value) {
                // Buscar la opción que coincida
                for (let option of select.options) {
                    if (option.textContent === value) {
                        option.selected = true;
                        break;
                    }
                }
                select.style.backgroundColor = '#f0f8ff';
                select.disabled = true;
            }
            break;
        }
    }
}

// Función auxiliar para llenar textarea por etiqueta
function fillTextAreaByLabel(labelText, value) {
    const labels = document.querySelectorAll('label');
    for (let label of labels) {
        if (label.textContent.includes(labelText)) {
            const textarea = label.parentElement.querySelector('textarea');
            if (textarea) {
                textarea.value = value || '';
                textarea.style.backgroundColor = '#f0f8ff';
                textarea.readOnly = true;
            }
            break;
        }
    }
}

// Función para capitalizar primera letra
function capitalizar(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Función para mostrar documentos
function mostrarDocumentos(solicitud) {
    // INE
    const ineContainer = document.querySelector('#INE').parentElement;
    if (solicitud.ineDocument) {
        const ineLink = document.createElement('a');
        ineLink.href = `http://44.208.231.53:7078${solicitud.ineDocument}`;
        ineLink.target = '_blank';
        ineLink.textContent = 'Ver INE';
        ineLink.style.cssText = 'display: block; margin-top: 10px; color: #3b82f6; text-decoration: underline;';
        ineContainer.appendChild(ineLink);
    }
    
    // Espacio mascota
    const espacioContainer = document.querySelector('#espacio-mascota').parentElement;
    if (solicitud.espacioMascota) {
        const espacioLink = document.createElement('a');
        espacioLink.href = `http://44.208.231.53:7078${solicitud.espacioMascota}`;
        espacioLink.target = '_blank';
        espacioLink.textContent = 'Ver espacio de mascota';
        espacioLink.style.cssText = 'display: block; margin-top: 10px; color: #3b82f6; text-decoration: underline;';
        espacioContainer.appendChild(espacioLink);
    }
}

// Función para configurar botones
function configurarBotones(solicitud) {
    const btnAceptar = document.querySelector('.btn-aceptar-status');
    const btnRechazar = document.querySelector('.btn-rechazar-status');
    
    if (btnAceptar) {
        btnAceptar.onclick = () => cambiarEstadoSolicitud(solicitud, 'aprobada');
    }
    
    if (btnRechazar) {
        btnRechazar.onclick = () => cambiarEstadoSolicitud(solicitud, 'rechazada');
    }
    
    // Si ya está procesada, deshabilitar botones
    if (solicitud.estadoSolicitud !== 'pendiente') {
        if (btnAceptar) btnAceptar.style.display = 'none';
        if (btnRechazar) btnRechazar.style.display = 'none';
    }
    
    // Agregar botón de regreso siempre
    const botonesContainer = document.querySelector('.registrar-boton');
    if (botonesContainer && !document.querySelector('.btn-regreso')) {
        const btnRegreso = document.createElement('a');
        btnRegreso.textContent = 'Regresar a solicitudes';
        btnRegreso.className = 'btn btn-regreso';
        btnRegreso.style.cssText = 'background-color: #6b7280; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; display: inline-block; margin-left: 10px;';
        btnRegreso.href = 'solicitudesdeadopcion.html';
        
        botonesContainer.appendChild(btnRegreso);
    }
}

// Función para cambiar estado de solicitud
async function cambiarEstadoSolicitud(solicitud, nuevoEstado) {
    if (!confirm(`¿Está seguro de ${nuevoEstado === 'aprobada' ? 'aprobar' : 'rechazar'} esta solicitud?`)) {
        return;
    }
    
    try {
        const response = await fetch(`http://44.208.231.53:7078/solicitudes-adopcion/${solicitud.adoptanteId}/${solicitud.mascotaId}`, {
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
            // Actualizar datos en localStorage
            solicitud.estadoSolicitud = nuevoEstado;
            localStorage.setItem('solicitudDetalle', JSON.stringify(solicitud));
            // Recargar página para actualizar vista
            location.reload();
        } else {
            throw new Error('Error al actualizar el estado');
        }
        
    } catch (error) {
        console.error('Error al cambiar estado:', error);
        alert('Error al actualizar el estado de la solicitud');
    }
}

// Cargar datos cuando se carga la página
document.addEventListener('DOMContentLoaded', cargarDatosSolicitud);