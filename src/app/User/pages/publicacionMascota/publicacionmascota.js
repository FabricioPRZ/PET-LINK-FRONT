document.addEventListener('DOMContentLoaded', function() {
            // Obtener el ID de la mascota de la URL
            const urlParams = new URLSearchParams(window.location.search);
            const mascotaId = urlParams.get('id');
            
            if (!mascotaId) {
                console.error('No se proporcionó ID de mascota');
                return;
            }

            // Elementos del DOM
            const imagenPrincipal = document.getElementById('imagenPrincipal');
            const imagenesMiniatura = document.getElementById('imagenesMiniatura');
            const nombreMascota = document.getElementById('nombreMascota');
            const especieMascota = document.getElementById('especieMascota');
            const sexoMascota = document.getElementById('sexoMascota');
            const desparasitado = document.getElementById('desparasitado');
            const tamanoMascota = document.getElementById('tamanoMascota');
            const discapacitado = document.getElementById('discapacitado');
            const enfermedades = document.getElementById('enfermedades');
            const pesoMascota = document.getElementById('pesoMascota');
            const esterilizado = document.getElementById('esterilizado');
            const listaVacunas = document.getElementById('listaVacunas');
            const descripcionMascota = document.getElementById('descripcionMascota');
            const btnAdoptar = document.getElementById('btnAdoptar');

            // Cargar datos de la mascota
            cargarMascota(mascotaId);

            // Configurar el botón de adoptar
            btnAdoptar.href = `/src/app/User/pages/formularioAdoptar/formulario-adoptar.html?id=${mascotaId}`;

            async function cargarMascota(id) {
                try {
                    const response = await fetch(`http://44.208.231.53:7078/mascotas/${id}`);
                    if (!response.ok) throw new Error('Error al obtener los datos de la mascota');

                    const mascota = await response.json();

                    // Mostrar los datos en la interfaz
                    mostrarDatosMascota(mascota);
                } catch (error) {
                    console.error('Error:', error);
                    // Mostrar mensaje de error al usuario
                    alert('No se pudo cargar la información de la mascota. Por favor, intente nuevamente.');
                }
            }

            function mostrarDatosMascota(mascota) {
                // Mostrar imagen principal (primera foto disponible o imagen por defecto)
                if (mascota.fotos_mascota && mascota.fotos_mascota.length > 0) {
                    imagenPrincipal.src = mascota.fotos_mascota[0].startsWith('http') ? 
                        mascota.fotos_mascota[0] : 
                        `http://44.208.231.53:7078${mascota.fotos_mascota[0]}`;
                    
                    // Mostrar miniaturas (si hay más de una imagen)
                    imagenesMiniatura.innerHTML = '';
                    mascota.fotos_mascota.forEach((foto, index) => {
                        if (index > 0) { // La primera ya está como imagen principal
                            const thumbnail = document.createElement('img');
                            thumbnail.src = foto.startsWith('http') ? foto : `http://44.208.231.53:7078${foto}`;
                            thumbnail.alt = `Imagen ${index + 1} de ${mascota.nombre}`;
                            thumbnail.className = 'pet-thumbnail';
                            thumbnail.onclick = () => {
                                imagenPrincipal.src = thumbnail.src;
                            };
                            imagenesMiniatura.appendChild(thumbnail);
                        }
                    });
                } else {
                    imagenPrincipal.src = '/src/public/img/default-pet.jpg';
                }

                // Manejar error de carga de imagen
                imagenPrincipal.onerror = function() {
                    this.src = '/src/public/img/default-pet.jpg';
                };

                // Mostrar información básica
                nombreMascota.textContent = mascota.nombre || 'No especificado';
                especieMascota.textContent = mascota.especie || 'No especificada';
                sexoMascota.textContent = mascota.sexo || 'No especificado';
                tamanoMascota.textContent = mascota.tamaño || 'No especificado';
                pesoMascota.textContent = mascota.peso ? `${mascota.peso} kg` : 'No especificado';
                descripcionMascota.textContent = mascota.descripcion || 'No hay descripción disponible';

                // Mostrar información de salud
                desparasitado.textContent = mascota.desparasitado ? 'Sí' : 'No';
                esterilizado.textContent = mascota.esterilizado ? 'Sí' : 'No';
                discapacitado.textContent = mascota.discapacitado ? 'Sí' : 'No';
                
                // Mostrar enfermedades
                enfermedades.textContent = mascota.enfermedades && mascota.enfermedades.length > 0 ? 
                    mascota.enfermedades.join(', ') : 'Ninguna';

                // Mostrar vacunas
                listaVacunas.innerHTML = '';
                if (mascota.vacunas && mascota.vacunas.length > 0) {
                    mascota.vacunas.forEach(vacuna => {
                        const li = document.createElement('li');
                        li.textContent = vacuna;
                        listaVacunas.appendChild(li);
                    });
                } else {
                    const li = document.createElement('li');
                    li.textContent = 'No registra vacunas';
                    listaVacunas.appendChild(li);
                }
            }
        });