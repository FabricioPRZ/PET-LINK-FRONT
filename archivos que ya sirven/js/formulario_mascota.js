document.addEventListener('DOMContentLoaded', function () {
    const mascotaForm = document.getElementById('mascotaForm');
    const submitButton = document.getElementById('enviarForm');

    // Verificar autenticación al cargar
    if (!authManager.isAuthenticated()) {
        alert('Debes iniciar sesión para registrar una mascota');
        authManager.logout();
        return;
    }

    mascotaForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        
        try {
            // Deshabilitar botón durante el envío
            submitButton.disabled = true;
            submitButton.textContent = 'Enviando...';

            // Validar formulario
            if (!validarFormulario()) {
                return;
            }

            const token = authManager.getToken();
            const userData = authManager.getUserData();
            const id_Cedente = userData?.id || 1;

            // Validar id_Cedente
            if (id_Cedente <= 0) {
                throw new Error('No se pudo identificar tu usuario');
            }

            // Crear objeto con los datos
            const mascotaData = {
                nombre_mascotas: document.getElementById('nombre').value,
                codigo_especie: parseInt(document.getElementById('especie').value),
                sexo: document.getElementById('sexo').value,
                peso: parseFloat(document.getElementById('peso').value),
                codigo_tamaño: parseInt(document.getElementById('tamano').value),
                raza: document.getElementById('raza').value,
                esterilizado: document.getElementById('esterilizada').value,
                desparasitado: document.getElementById('desparasitada').value,
                discapacitado: document.getElementById('condiciones').value || '',
                enfermedades: document.getElementById('enfermedades').value || '',
                codigo_vacunas: parseInt(document.getElementById('vacunas').value),
                descripcion: document.getElementById('descripcion-mascota').value,
                id_Cedente: id_Cedente
            };

            // Validaciones adicionales
            if (mascotaData.codigo_especie <= 0 || 
                mascotaData.codigo_tamaño <= 0 || 
                mascotaData.codigo_vacunas <= 0) {
                throw new Error('Por favor verifica los códigos de especie, tamaño y vacunas');
            }

            if (isNaN(mascotaData.peso) || mascotaData.peso <= 0) {
                throw new Error('El peso debe ser un número positivo');
            }

            // Enviar datos al backend
            const response = await fetch('http://44.208.231.53:7078/mascotas', {
                method: 'POST',
                body: JSON.stringify(mascotaData),
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // Solo verificar si la respuesta fue exitosa (status 200-299)
            if (response.ok) {
                // No intentamos parsear el JSON, solo mostramos éxito
                alert('Éxito');
                mascotaForm.reset();
            } else {
                // Si hay error, mostramos un mensaje genérico
                throw new Error('Ocurrió un error al registrar la mascota');
            }

        } catch (error) {
            console.error('Error al enviar el formulario:', error);
            
            // Mostrar mensaje de error solo si no es el mensaje de JSON inválido
            if (!error.message.includes('Unexpected token') && 
                !error.message.includes('is not valid JSON')) {
                alert(`Error: ${error.message}`);
            } else {
                alert('Ocurrió un error al procesar la respuesta');
            }
            
            // Cerrar sesión si hay problemas de autenticación
            if (error.message.includes('token') || 
                error.message.includes('autenticación') || 
                error.message.includes('usuario')) {
                authManager.logout();
            }
        } finally {
            // Restaurar botón
            submitButton.disabled = false;
            submitButton.textContent = 'Enviar formulario';
        }
    });

    function validarFormulario() {
        const camposObligatorios = [
            { id: 'nombre', nombre: 'Nombre' },
            { id: 'especie', nombre: 'Especie' },
            { id: 'raza', nombre: 'Raza' },
            { id: 'tamano', nombre: 'Tamaño' },
            { id: 'peso', nombre: 'Peso' },
            { id: 'sexo', nombre: 'Sexo' },
            { id: 'esterilizada', nombre: 'Esterilizada' },
            { id: 'desparasitada', nombre: 'Desparasitada' },
            { id: 'vacunas', nombre: 'Vacunas' },
            { id: 'descripcion-mascota', nombre: 'Descripción' }
        ];

        for (const campo of camposObligatorios) {
            const element = document.getElementById(campo.id);
            if (!element || !element.value) {
                alert(`Por favor completa el campo: ${campo.nombre}`);
                element?.focus();
                return false;
            }
        }

        const peso = parseFloat(document.getElementById('peso').value);
        if (isNaN(peso) || peso <= 0) {
            alert('Por favor ingresa un peso válido (mayor que 0)');
            return false;
        }

        const codigoVacunas = parseInt(document.getElementById('vacunas').value);
        if (isNaN(codigoVacunas) || codigoVacunas <= 0) {
            alert('Por favor ingresa un código de vacuna válido (mayor que 0)');
            return false;
        }

        const codigoEspecie = parseInt(document.getElementById('especie').value);
        if (isNaN(codigoEspecie) || codigoEspecie <= 0) {
            alert('Por favor selecciona una especie válida');
            return false;
        }

        const codigoTamano = parseInt(document.getElementById('tamano').value);
        if (isNaN(codigoTamano) || codigoTamano <= 0) {
            alert('Por favor selecciona un tamaño válido');
            return false;
        }

        return true;
    }
});