document.addEventListener('DOMContentLoaded', function () {
    const tbody = document.getElementById('tbodySolicitudes');

    // Función para actualizar el estado de una mascota
    async function actualizarEstado(id, nuevoEstado) {
        try {
            // Primero obtener los datos actuales de la mascota
            const getMascotaResponse = await fetch(`http://44.208.231.53:7078/mascotas/${id}`);
            if (!getMascotaResponse.ok) {
                throw new Error('Error al obtener los datos de la mascota');
            }
            
            const mascotaActual = await getMascotaResponse.json();
            
            // Crear FormData con todos los datos de la mascota
            const formData = new FormData();
            
            // Agregar todos los campos existentes
            Object.keys(mascotaActual).forEach(key => {
                if (key === 'estado') {
                    formData.append(key, nuevoEstado); // Usar el nuevo estado
                } else if (mascotaActual[key] !== null && mascotaActual[key] !== undefined) {
                    formData.append(key, mascotaActual[key]);
                }
            });

            const response = await fetch(`http://44.208.231.53:7078/mascotas/${id}`, {
                method: 'PUT',
                body: formData // Sin Content-Type header, el navegador lo configurará automáticamente
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`Error al actualizar el estado: ${response.status} - ${errorText}`);
            }

            // Recargar la tabla después de actualizar
            cargarMascotas();
            alert('Estado actualizado correctamente');
        } catch (error) {
            console.error('Error completo:', error);
            alert(`Ocurrió un error al actualizar el estado: ${error.message}`);
        }
    }

    // Función para cargar las mascotas desde la API
    async function cargarMascotas() {
        try {
            const response = await fetch('http://44.208.231.53:7078/mascotas');
            if (!response.ok) {
                throw new Error('Error al obtener las mascotas');
            }

            const mascotas = await response.json();

            // Limpiar el tbody
            tbody.innerHTML = '';

            // Si no hay mascotas
            if (mascotas.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7">No hay mascotas registradas</td></tr>';
                return;
            }

            // Llenar la tabla con los datos de las mascotas
            mascotas.forEach((mascota, index) => {
                const row = document.createElement('tr');
                row.className = index % 2 === 0 ? 'row-even' : 'row-odd';

                // Formatear la fecha de registro
                let fechaFormateada = 'Fecha no disponible';
                if (mascota.fechaRegistro) {
                    const fecha = new Date(mascota.fechaRegistro);
                    fechaFormateada = fecha.toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                }

                // Determinar la clase del badge según el estado
                let badgeClass = 'pendiente';
                let estadoMostrado = 'Pendiente';
                
                switch (mascota.estado) {
                    case 'aprobado':
                        badgeClass = 'aprobado';
                        estadoMostrado = 'Aprobado';
                        break;
                    case 'rechazado':
                        badgeClass = 'rechazado';
                        estadoMostrado = 'Rechazado';
                        break;
                    case 'en_proceso':
                        badgeClass = 'en-proceso';
                        estadoMostrado = 'En Proceso';
                        break;
                    case 'no_disponible':
                        badgeClass = 'no-disponible';
                        estadoMostrado = 'No Disponible';
                        break;
                    default:
                        badgeClass = 'pendiente';
                        estadoMostrado = 'Pendiente';
                }

                row.innerHTML = `
                    <td>${mascota.id}</td>
                    <td>${mascota.idCedente}</td>
                    <td>${mascota.nombre}</td>
                    <td>${mascota.especie}</td>
                    <td>${fechaFormateada}</td>
                    <td><span class="badge ${badgeClass}">${estadoMostrado}</span></td>
                    <td>
                        <button class="action-btn btn-approve" data-id="${mascota.id}">Aprobar</button>
                        <button class="action-btn btn-reject" data-id="${mascota.id}">Rechazar</button>
                        <button class="action-btn btn-view">Ver</button>
                    </td>
                `;

                tbody.appendChild(row);
            });

            // Agregar event listeners a los botones después de crear las filas
            document.querySelectorAll('.btn-approve').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.target.getAttribute('data-id');
                    actualizarEstado(id, 'en_proceso'); // Cambio aquí: ahora envía 'en_proceso'
                });
            });

            document.querySelectorAll('.btn-reject').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.target.getAttribute('data-id');
                    actualizarEstado(id, 'no_disponible'); // Cambio aquí: ahora envía 'no_disponible'
                });
            });

        } catch (error) {
            console.error('Error:', error);
            tbody.innerHTML = '<tr><td colspan="7">Error al cargar las mascotas</td></tr>';
        }
    }

    cargarMascotas();
});