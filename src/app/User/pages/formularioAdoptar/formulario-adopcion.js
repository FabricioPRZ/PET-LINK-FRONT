document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('adoption-form');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            const formData = new FormData(form);

            // Verificación adicional (opcional)
            const ineFile = document.getElementById('INE').files[0];
            const espacioFile = document.getElementById('espacio-mascota').files[0];

            if (!ineFile || !espacioFile) {
                alert('Debes subir los archivos requeridos.');
                return;
            }

            const token = localStorage.getItem('token');
            if (!token) {
                alert('Sesión inválida. Por favor inicia sesión.');
                return;
            }

            const response = await fetch('http://44.208.231.53:7078/solicitudes-adopcion', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const responseText = await response.text();
            console.log('📦 Respuesta del servidor:', responseText);

            if (!response.ok) {
                const error = JSON.parse(responseText);
                throw new Error(error.message || 'Error al enviar el formulario');
            }

            alert('Formulario enviado correctamente 🎉');
            form.reset();
        } catch (error) {
            console.error('❌ Error al enviar el formulario:', error);
            alert(`Error: ${error.message}`);
        }
    });
});
