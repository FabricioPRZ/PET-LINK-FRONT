document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.pet-form');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');

            if (!token || !userId) {
                throw new Error('Sesión no válida. Por favor inicie sesión nuevamente.');
            }

            // Obtener datos del formulario
            const nombre = document.getElementById('pet-name').value.trim();
            const especie = document.getElementById('pet-species').value.trim();
            const sexo = document.getElementById('pet-gender').value;
            const peso = document.getElementById('pet-weight').value;
            const tamaño = document.getElementById('pet-size').value;
            const esterilizado = document.getElementById('pet-sterilized').value.toLowerCase();
            const discapacitado = document.getElementById('pet-disabled').value.toLowerCase();
            const desparasitado = document.getElementById('pet-dewormed').value.toLowerCase();
            const vacunado = document.getElementById('pet-vaccinated').value.toLowerCase();

            const descripcion = document.getElementById('pet-description').value.trim();

            // Procesar imágenes
            const imageInputs = document.querySelectorAll('.upload-box input[type="file"]');
            const imageFiles = Array.from(imageInputs).map(input => input.files[0]).filter(Boolean);

            if (imageFiles.length < 3) {
                alert('Debes subir al menos 3 imágenes de la mascota.');
                return;
            }

            // Crear FormData
            const formData = new FormData();
            formData.append('nombre', nombre);
            formData.append('especie', especie);
            formData.append('sexo', sexo);
            formData.append('peso', peso);
            formData.append('tamaño', tamaño);
            formData.append('esterilizado', esterilizado);
            formData.append('discapacitado', discapacitado);
            formData.append('desparasitado', desparasitado);
            formData.append('vacunas', vacunado);
            formData.append('descripcion', descripcion);
            formData.append('idCedente', userId);
            formData.append('estado', 'pendiente');

            // Añadir imágenes al FormData
            imageFiles.forEach((file, index) => {
                formData.append(`fotos_mascota`, file);
            });

            // Enviar solicitud
            const response = await fetch('http://44.208.231.53:7078/mascotas', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            console.log('📡 Código de respuesta:', response.status);
            const responseText = await response.text();
            console.log('📦 Respuesta del servidor:', responseText);

            if (!response.ok) {
                let error;
                try {
                    error = JSON.parse(responseText);
                } catch {
                    error = { message: responseText };
                }
                throw new Error(error.message || `Error ${response.status}: ${response.statusText}`);
            }

            alert('Solicitud de registro enviada.');
            form.reset();

        } catch (error) {
            console.error('❌ Error al registrar mascota:', error);
            alert(`Error: ${error.message}`);
        }
    });
});