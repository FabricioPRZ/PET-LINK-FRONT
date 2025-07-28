// ine.js - Manejo de la vista de identificación

document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Obtener datos del usuario del localStorage
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        if (!token || !userId) {
            throw new Error('No se encontraron datos de sesión. Por favor inicie sesión nuevamente.');
        }

        // Mostrar estado de carga
        const imgElement = document.getElementById('INE-img');
        imgElement.src = '/src/public/otros/loading_INE.svg';
        imgElement.alt = 'Cargando identificación...';

        // 1. Obtener datos del usuario incluyendo la INE
        const userResponse = await fetch(`http://44.208.231.53:7078/usuarios/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!userResponse.ok) {
            throw new Error('Error al obtener datos del usuario');
        }

        const usuario = await userResponse.json();
        
        // 2. Verificar si tiene INE registrada
        if (!usuario.ine) {
            imgElement.src = '/src/public/otros/no_INE.svg';
            imgElement.alt = 'No hay identificación registrada';
            document.getElementById('btn-actualizar').textContent = 'Subir identificación';
            return;
        }

        // 3. Obtener la imagen de la INE
        const ineResponse = await fetch(`http://44.208.231.53:7078/usuarios/${userId}/ine`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!ineResponse.ok) {
            throw new Error('Error al obtener la identificación');
        }

        // Crear URL para la imagen
        const imageBlob = await ineResponse.blob();
        const imageUrl = URL.createObjectURL(imageBlob);
        
        // Mostrar la imagen
        imgElement.src = imageUrl;
        imgElement.alt = 'Identificación del usuario';
        imgElement.style.maxHeight = '500px';
        imgElement.style.objectFit = 'contain';

        // 4. Configurar eventos para actualizar INE
        configurarEventosActualizacion(userId, token);

    } catch (error) {
        console.error('Error al cargar identificación:', error);
        mostrarErrorINE(error.message);
    }
});

function configurarEventosActualizacion(userId, token) {
    const inputFile = document.getElementById('input-file');
    const btnActualizar = document.getElementById('btn-actualizar');
    const modalConfirmar = document.getElementById('modal-confirmar');
    const previewImg = document.getElementById('preview-img');
    const btnConfirmar = document.getElementById('btn-confirmar');
    const btnCancelar = document.getElementById('btn-cancelar');

    // Abrir selector de archivos al hacer clic en Actualizar
    btnActualizar.addEventListener('click', () => {
        inputFile.click();
    });

    // Mostrar vista previa cuando se selecciona un archivo
    inputFile.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            
            // Validar tipo de archivo
            if (!file.type.match('image.*') && file.type !== 'application/pdf') {
                mostrarErrorINE('Solo se permiten imágenes o archivos PDF');
                return;
            }
            
            // Validar tamaño (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                mostrarErrorINE('El archivo no debe exceder los 5MB');
                return;
            }

            // Mostrar vista previa si es imagen
            if (file.type.match('image.*')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    previewImg.src = event.target.result;
                    modalConfirmar.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                // Para PDF mostrar un placeholder
                previewImg.src = '/src/public/otros/pdf_icon.svg';
                modalConfirmar.style.display = 'block';
            }
        }
    });

    // Confirmar actualización
    btnConfirmar.addEventListener('click', async () => {
        try {
            btnConfirmar.disabled = true;
            btnConfirmar.innerHTML = '<span class="spinner"></span> Subiendo...';
            
            const formData = new FormData();
            formData.append('ine', inputFile.files[0]);
            
            const response = await fetch(`http://44.208.231.53:7078/usuarios/${userId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Error al subir la identificación');
            }

            // Actualizar la vista
            const imageBlob = await response.blob();
            const imageUrl = URL.createObjectURL(imageBlob);
            document.getElementById('INE-img').src = imageUrl;
            
            // Cerrar modal y resetear
            modalConfirmar.style.display = 'none';
            inputFile.value = '';
            btnConfirmar.disabled = false;
            btnConfirmar.innerHTML = '✓ Confirmar';
            
            mostrarMensajeExito('Identificación actualizada correctamente');
            
        } catch (error) {
            console.error('Error al actualizar INE:', error);
            mostrarErrorINE(error.message);
            btnConfirmar.disabled = false;
            btnConfirmar.innerHTML = '✓ Confirmar';
        }
    });

    // Cancelar actualización
    btnCancelar.addEventListener('click', () => {
        modalConfirmar.style.display = 'none';
        inputFile.value = '';
    });
}

function mostrarErrorINE(mensaje) {
    const container = document.querySelector('.identification-content');
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.innerHTML = `
        <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="#d32f2f" d="M11,15H13V17H11V15M11,7H13V13H11V7M12,2C6.47,2,2,6.5,2,12A10,10,0,0,0,12,22A10,10,0,0,0,22,12A10,10,0,0,0,12,2M12,20A8,8,0,0,1,4,12A8,8,0,0,1,12,4A8,8,0,0,1,20,12A8,8,0,0,1,12,20Z"/>
        </svg>
        <span>${mensaje}</span>
    `;
    
    errorElement.style.cssText = `
        display: flex;
        align-items: center;
        padding: 12px;
        margin: 16px;
        background-color: #ffebee;
        color: #d32f2f;
        border-radius: 4px;
        border-left: 4px solid #d32f2f;
        font-size: 14px;
    `;
    
    container.prepend(errorElement);
    
    // Eliminar mensaje después de 5 segundos
    setTimeout(() => {
        errorElement.remove();
    }, 5000);
}

function mostrarMensajeExito(mensaje) {
    const container = document.querySelector('.identification-content');
    const successElement = document.createElement('div');
    successElement.className = 'success-message';
    successElement.innerHTML = `
        <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="#4CAF50" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
        </svg>
        <span>${mensaje}</span>
    `;
    
    successElement.style.cssText = `
        display: flex;
        align-items: center;
        padding: 12px;
        margin: 16px;
        background-color: #e8f5e9;
        color: #4CAF50;
        border-radius: 4px;
        border-left: 4px solid #4CAF50;
        font-size: 14px;
    `;
    
    container.prepend(successElement);
    
    // Eliminar mensaje después de 5 segundos
    setTimeout(() => {
        successElement.remove();
    }, 5000);
}