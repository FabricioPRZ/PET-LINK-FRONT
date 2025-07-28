document.addEventListener('DOMContentLoaded', function() {
    const tbody = document.getElementById('tbodySolicitudes');
    
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
                
                row.innerHTML = `
                    <td>${mascota.id}</td>
                    <td>${mascota.idCedente}</td>
                    <td>${mascota.nombre}</td>
                    <td>${mascota.especie}</td>
                    <td>Fecha no disponible</td>
                    <td><span class="badge pendiente">Pendiente</span></td>
                    <td>
                        <button class="action-btn btn-approve">Aprobar</button>
                        <button class="action-btn btn-reject">Rechazar</button>
                        <button class="action-btn btn-view">Ver</button>
                    </td>
                `;
                
                tbody.appendChild(row);
            });
            
        } catch (error) {
            console.error('Error:', error);
            tbody.innerHTML = '<tr><td colspan="7">Error al cargar las mascotas</td></tr>';
        }
    }
    
    // Cargar las mascotas al cargar la página
    cargarMascotas();
});