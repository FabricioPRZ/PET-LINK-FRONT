document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const especieSelect = document.getElementById('especie-select');
    const tamanoSelect = document.getElementById('tamano-select');
    const sexoSelect = document.getElementById('sexo-select');
    const buscarBtn = document.getElementById('buscar-btn');
    const cardsContainer = document.getElementById('cards-container');

    // Cargar especies disponibles al inicio
    loadEspecies();
    
    // Cargar mascotas al inicio
    loadMascotas();

    // Evento para el botón de búsqueda
    buscarBtn.addEventListener('click', loadMascotas);

    // Función para cargar las especies en el select
    async function loadEspecies() {
        try {
            const response = await fetch('/api/mascotas/especies');
            if (!response.ok) throw new Error('Error al obtener especies');
            
            const especies = await response.json();
            
            // Limpiar y agregar opciones
            especieSelect.innerHTML = '<option value="" selected>Todas las especies</option>';
            especies.forEach(especie => {
                const option = document.createElement('option');
                option.value = especie;
                option.textContent = especie;
                especieSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error:', error);
        }
    }

    // Función principal para cargar y mostrar mascotas
    async function loadMascotas() {
        try {
            // Mostrar loader
            cardsContainer.innerHTML = '<div class="loader">Cargando mascotas...</div>';
            
            // Obtener valores de los filtros
            const especie = especieSelect.value;
            const tamaño = tamanoSelect.value;
            const sexo = sexoSelect.value;
            
            // Construir URL con parámetros de filtro
            let url = 'http://44.208.231.53:7078/mascotas';
            const params = new URLSearchParams();
            
            if (especie) params.append('especie', especie);
            if (tamaño) params.append('tamaño', tamaño);
            if (sexo) params.append('sexo', sexo);
            
            if (params.toString()) url += `?${params.toString()}`;
            
            // Hacer la petición
            const response = await fetch(url);
            if (!response.ok) throw new Error('Error al obtener mascotas');
            
            const mascotas = await response.json();
            
            // Filtrar mascotas con estado "en_proceso" y mostrar
            displayMascotas(mascotas.filter(m => m.estado === "en_proceso"));
        } catch (error) {
            console.error('Error:', error);
            cardsContainer.innerHTML = `<div class="error-message">Error al cargar las mascotas: ${error.message}</div>`;
        }
    }

    // Función para mostrar las mascotas en cards
    function displayMascotas(mascotas) {
        if (mascotas.length === 0) {
            cardsContainer.innerHTML = '<div class="no-results">No se encontraron mascotas disponibles para adopción.</div>';
            return;
        }
        
        cardsContainer.innerHTML = '';
        
        mascotas.forEach(mascota => {
            const card = document.createElement('div');
            card.className = 'pet-card';
            
            // Construir la imagen (usar una por defecto si no hay)
            const imagenUrl = mascota.imagen_url || '/src/public/img/default-pet.jpg';
            
            card.innerHTML = `
                <img src="${imagenUrl}" alt="${mascota.nombre}" class="pet-image" onerror="this.src='/src/public/img/default-pet.jpg'">
                <div class="pet-info">
                    <div class="pet-info-row">
                        <span class="pet-info-label">Nombre:</span>
                        <span class="pet-info-value">${mascota.nombre || 'No especificado'}</span>
                    </div>
                    <div class="pet-info-row">
                        <span class="pet-info-label">Edad:</span>
                        <span class="pet-info-value">${mascota.edad || '?'} ${mascota.edad ? 'años' : ''}</span>
                    </div>
                    <div class="pet-info-row">
                        <span class="pet-info-label">Especie:</span>
                        <span class="pet-info-value">${mascota.especie || 'No especificada'}</span>
                    </div>
                    <div class="pet-info-row">
                        <span class="pet-info-label">Tamaño:</span>
                        <span class="pet-info-value">${mascota.tamaño || 'No especificado'}</span>
                    </div>
                </div>
                <div class="pet-buttons">
                    <button class="btn btn-status" data-id="${mascota.id}">Adoptar</button>
                    <button class="btn btn-status-ver-mas" data-id="${mascota.id}">Ver más</button>
                </div>
            `;
            
            cardsContainer.appendChild(card);
        });
        
        // Agregar event listeners a los botones
        document.querySelectorAll('.btn-status').forEach(btn => {
            btn.addEventListener('click', () => iniciarAdopcion(btn.dataset.id));
        });
        
        document.querySelectorAll('.btn-status-ver-mas').forEach(btn => {
            btn.addEventListener('click', () => verDetalles(btn.dataset.id));
        });
    }

    // Función para iniciar proceso de adopción
    function iniciarAdopcion(mascotaId) {
        // Aquí implementarías la lógica para iniciar el proceso de adopción
        console.log(`Iniciando adopción para mascota ID: ${mascotaId}`);
        alert(`Has solicitado adoptar a esta mascota (ID: ${mascotaId})`);
    }

    // Función para ver detalles de la mascota
    function verDetalles(mascotaId) {
        // Redirigir a la página de detalles o mostrar un modal
        console.log(`Viendo detalles de mascota ID: ${mascotaId}`);
        window.location.href = `/src/app/User/pages/publicacioMascota/publicacionmascota.html?id=${mascotaId}`;
    }
});