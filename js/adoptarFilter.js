document.addEventListener('DOMContentLoaded', async function () {
    const buscarBtn = document.getElementById('buscar-btn');
    const especieSelect = document.getElementById('especie-select');
    const tamanoSelect = document.getElementById('tamano-select');
    const sexoSelect = document.getElementById('sexo-select');
    const cardsContainer = document.getElementById('cards-container');

    let mascotas = [];

    async function obtenerMascotas() {
        try {
            const response = await fetch('http://44.208.231.53:7078/mascotas');
            if (!response.ok) {
                throw new Error('Error al obtener las mascotas');
            }
            mascotas = await response.json();

            mascotas = [
                {
                    id: 1,
                    nombre: "Peluchín",
                    edad: "1 año",
                    especie: "Perro",
                    tamaño: "Mediano",
                    sexo: "Macho",
                    imagen: "/img/peluchin.jpg"
                },
                {
                    id: 2,
                    nombre: "Athena",
                    edad: "9 meses",
                    especie: "Hámster",
                    tamaño: "Pequeño",
                    sexo: "Hembra",
                    imagen: "/img/athena.jpg"
                },
                {
                    id: 3,
                    nombre: "Marina",
                    edad: "3 años",
                    especie: "Gato",
                    tamaño: "Pequeño",
                    sexo: "Hembra",
                    imagen: "/img/marina.jpg"
                },
                {
                    id: 4,
                    nombre: "Bartolomé",
                    edad: "2 años",
                    especie: "Conejo",
                    tamaño: "Mediano",
                    sexo: "Macho",
                    imagen: "/img/bartolomé.jpg"
                }
            ];

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

            cardsContainer.appendChild(card);
        });
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