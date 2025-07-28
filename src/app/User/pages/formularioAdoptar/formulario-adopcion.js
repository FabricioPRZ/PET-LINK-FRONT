document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('adoption-form');
    const urlParams = new URLSearchParams(window.location.search);
    const mascotaId = urlParams.get('id');

    // Verificar si hay una mascota seleccionada
    if (!mascotaId) {
        alert('No se ha especificado una mascota para adoptar');
        window.location.href = '/adoptar.html';
        return;
    }

    // Verificar si el usuario está logueado
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
        alert('Debes iniciar sesión para adoptar una mascota');
        window.location.href = '/login.html';
        return;
    }

    // Obtener datos del usuario logueado
    try {
        const userResponse = await fetch(`http://44.208.231.53:7078/usuarios/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!userResponse.ok) {
            throw new Error('Error al obtener datos del usuario');
        }

        const userData = await userResponse.json();

        // Autocompletar campos del formulario
        document.getElementById('nombre').value = userData.nombres || '';
        document.getElementById('apellido-paterno').value = userData.apellido_paterno || '';
        document.getElementById('apellido-materno').value = userData.apellido_materno || '';
        document.getElementById('edad').value = userData.edad || '';
        document.getElementById('correo').value = userData.correo || '';

        // Hacer campos de datos personales readonly
        const personalDataFields = [
            'nombre', 'apellido-paterno', 'apellido-materno',
            'edad', 'correo'
        ];

        personalDataFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.readOnly = true;
                field.classList.add('readonly-field');
            }
        });

    } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
        // Continuar sin autocompletar si hay error
    }

    // Manejar envío del formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            const formData = new FormData(form);

            // Debug: Mostrar los datos del formulario antes de modificar
            console.log('Datos del formulario original:');
            for (let [key, value] of formData.entries()) {
                console.log(`${key}:`, value);
            }

            // Agregar los campos adicionales que no están en el formulario
            formData.append('mascota_id', mascotaId);
            formData.append('adoptante_id', userId);

            // Renombrar campos para que coincidan con el backend (usar snake_case)
            formData.append('apellido_paterno', formData.get('apellido-paterno'));
            formData.append('apellido_materno', formData.get('apellido-materno'));
            formData.append('personas_vivienda', formData.get('personas-vivienda'));
            formData.append('hay_ninos', formData.get('hay-ninos'));
            formData.append('permite_mascotas', formData.get('permite-mascotas'));
            formData.append('tipo_vivienda', formData.get('tipo-vivienda'));
            formData.append('tipo_propiedad', formData.get('tipo-propiedad')); // Note: Fix typo in your backend if this is "propiedad" vs "propierty"
            formData.append('historial_mascotas', formData.get('historial-mascotas'));

            // Manejar archivos con los nombres correctos
            const ineFile = document.getElementById('INE').files[0];
            const espacioFile = document.getElementById('espacio-mascota').files[0];

            // Eliminar los campos antiguos
            ['apellido-paterno', 'apellido-materno', 'personas-vivienda',
                'hay-ninos', 'permite-mascotas', 'tipo-vivienda',
                'tipo-propiedad', 'historial-mascotas', 'INE', 'espacio-mascota'].forEach(field => {
                    formData.delete(field);
                });

            // Añadir archivos con los nombres correctos
            if (ineFile) formData.append('ine_document', ineFile);
            if (espacioFile) formData.append('espacio_mascota', espacioFile);

            // Debug: Mostrar los datos del formulario después de modificar
            console.log('Datos del formulario modificados:');
            for (let [key, value] of formData.entries()) {
                console.log(`${key}:`, value);
            }

            // Validar archivos
            if (!ineFile || !espacioFile) {
                throw new Error('Ambos documentos (INE y espacio mascota) son obligatorios');
            }

            // Mostrar loader
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Enviando... <span class="spinner"></span>';

            // Enviar solicitud
            const response = await fetch('http://44.208.231.53:7078/solicitudes-adopcion', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Detalles del error:', errorData);
                throw new Error(errorData.error || 'Error al enviar el formulario');
            }

            const result = await response.json();
            alert('Solicitud de adopción enviada con éxito. Nos pondremos en contacto contigo pronto.');
            window.location.href = '/src/app/User/pages/adoptar/adoptar.html';

        } catch (error) {
            console.error('Error al enviar formulario:', error);
            alert(`Error: ${error.message}`);

            // Restaurar botón de enviar
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Enviar formulario <span class="button-icon">→</span>';
            }
        }
    });
});