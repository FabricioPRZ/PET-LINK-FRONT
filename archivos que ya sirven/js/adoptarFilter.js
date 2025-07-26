document.addEventListener('DOMContentLoaded', async function () {
    const buscarBtn = document.getElementById('buscar-btn');
    const especieSelect = document.getElementById('especie-select');
    const tamanoSelect = document.getElementById('tamano-select');
    const sexoSelect = document.getElementById('sexo-select');
    const cardsContainer = document.getElementById('cards-container');

    const especiesMap = {
        1: "Perro",
        2: "Gato",
        3: "Hamster",
        4: "Tortuga"
    };

    const tamanosMap = {
        1: "Pequeño",
        2: "Mediano",
        3: "Grande"
    };

    let mascotas = [];

    async function obtenerMascotas() {
        try {
            const response = await fetch('http://44.208.231.53:7078/mascotas');
            if (!response.ok) {
                throw new Error('Error al obtener las mascotas');
            }
            mascotas = await response.json();
            
            mascotas = mascotas.map(mascota => ({
                id: mascota.id_mascotas,
                nombre: mascota.nombre_mascotas,
                edad: "Edad no especificada", 
                especie: especiesMap[mascota.codigo_especie] || "Desconocido",
                tamaño: tamanosMap[mascota.codigo_tamaño] || "Desconocido",
                sexo: mascota.sexo,
                imagen: "/img/default-pet.jpg" 
            }));

            cargarEspeciesUnicas();
            renderizarMascotas(mascotas);
        } catch (error) {
            console.error('Error:', error);
            cardsContainer.innerHTML = '<p>Error al cargar las mascotas. Intenta nuevamente más tarde.</p>';
        }
    }

    function cargarEspeciesUnicas() {
        const especies = [...new Set(mascotas.map(m => m.especie))];
        especies.forEach(especie => {
            const option = document.createElement('option');
            option.value = especie;
            option.textContent = especie;
            especieSelect.appendChild(option);
        });
    }

    function renderizarMascotas(mascotasFiltradas) {
        cardsContainer.innerHTML = '';

        if (mascotasFiltradas.length === 0) {
            cardsContainer.innerHTML = '<p>No se encontraron mascotas con los filtros seleccionados.</p>';
            return;
        }

        const gridContainer = document.createElement('div');
        gridContainer.style.display = 'flex';
        gridContainer.style.flexWrap = 'wrap';
        gridContainer.style.gap = '20px';
        gridContainer.style.justifyContent = 'center';
        
        mascotasFiltradas.forEach(mascota => {
            const card = document.createElement('div');
            card.className = 'pet-card';
            card.dataset.especie = mascota.especie;
            card.dataset.tamano = mascota.tamaño;
            card.dataset.sexo = mascota.sexo;

            card.innerHTML = `
                <img src="${mascota.imagen}" alt="${mascota.nombre}" class="pet-image">
                <div class="pet-info">
                    <div class="pet-info-row">
                        <span class="pet-info-label">Nombre:</span>
                        <span class="pet-info-value">${mascota.nombre}</span>
                    </div>
                    <div class="pet-info-row">
                        <span class="pet-info-label">Edad:</span>
                        <span class="pet-info-value">${mascota.edad}</span>
                    </div>
                    <div class="pet-info-row">
                        <span class="pet-info-label">Especie:</span>
                        <span class="pet-info-value">${mascota.especie}</span>
                    </div>
                </div>
                <div class="pet-buttons">
                    <button class="btn btn-status">Ver más</button>
                    <button class="btn btn-status-eliminar">Adoptar</button>
                </div>
            `;

            gridContainer.appendChild(card);
        });

        cardsContainer.appendChild(gridContainer);
    }

    function filtrarMascotas() {
        const especieValue = especieSelect.value;
        const tamanoValue = tamanoSelect.value;
        const sexoValue = sexoSelect.value;

        const mascotasFiltradas = mascotas.filter(mascota => {
            const especieMatch = !especieValue || mascota.especie === especieValue;
            const tamanoMatch = !tamanoValue || mascota.tamaño === tamanoValue;
            const sexoMatch = !sexoValue || mascota.sexo === sexoValue;

            return especieMatch && tamanoMatch && sexoMatch;
        });

        renderizarMascotas(mascotasFiltradas);
    }

    buscarBtn.addEventListener('click', filtrarMascotas);

    [especieSelect, tamanoSelect, sexoSelect].forEach(select => {
        select.addEventListener('change', filtrarMascotas);
    });

    await obtenerMascotas();
});