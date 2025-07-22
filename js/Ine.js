document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const btnActualizar = document.getElementById('btn-actualizar');
    const inputFile = document.getElementById('input-file');
    const modalConfirmar = document.getElementById('modal-confirmar');
    const btnConfirmar = document.getElementById('btn-confirmar');
    const btnCancelar = document.getElementById('btn-cancelar');
    const previewImg = document.getElementById('preview-img');
    const INEImg = document.getElementById('INE-img');

    // Cargar la imagen actual (si existe)
    cargarImagenActual();

    // Evento para abrir el selector de archivos
    btnActualizar.addEventListener('click', function() {
        inputFile.click();
    });

    // Evento cuando se selecciona un archivo
    inputFile.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            
            reader.onload = function(event) {
                // Mostrar vista previa en el modal
                previewImg.src = event.target.result;
                // Mostrar el modal de confirmación
                modalConfirmar.style.display = 'block';
            }
            
            reader.readAsDataURL(e.target.files[0]);
        }
    });

    // Evento para confirmar la actualización
    btnConfirmar.addEventListener('click', async function() {
        const file = inputFile.files[0];
        if (!file) return;

        try {
            // Aquí iría la lógica para subir la imagen al servidor
            // Por ahora simulamos la subida con un setTimeout
            mostrarCargando(true);
            
            // Simular carga al servidor (reemplazar con fetch real)
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Actualizar la imagen mostrada
            INEImg.src = URL.createObjectURL(file);
            
            // Cerrar modal y resetear input
            modalConfirmar.style.display = 'none';
            inputFile.value = '';
            
            mostrarMensaje('Identificación actualizada correctamente');
        } catch (error) {
            console.error('Error al actualizar identificación:', error);
            mostrarMensaje('Error al actualizar identificación', true);
        } finally {
            mostrarCargando(false);
        }
    });

    // Evento para cancelar la actualización
    btnCancelar.addEventListener('click', function() {
        modalConfirmar.style.display = 'none';
        inputFile.value = '';
    });

    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', function(event) {
        if (event.target === modalConfirmar) {
            modalConfirmar.style.display = 'none';
            inputFile.value = '';
        }
    });

    // Función para cargar la imagen actual del servidor
    async function cargarImagenActual() {
        try {
            mostrarCargando(true);
            // Aquí iría la petición al servidor para obtener la imagen actual
            // Por ahora usamos un placeholder
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Simulamos que no hay imagen guardada (mostrar placeholder)
            // INEImg.src = "/otros/placeholder_INE.svg";
            
        } catch (error) {
            console.error('Error al cargar identificación:', error);
            mostrarMensaje('Error al cargar identificación', true);
        } finally {
            mostrarCargando(false);
        }
    }

    // Función para mostrar/ocultar carga
    function mostrarCargando(mostrar) {
        const loader = document.getElementById('loader') || crearLoader();
        if (mostrar) {
            loader.style.display = 'block';
        } else {
            loader.style.display = 'none';
        }
    }

    function crearLoader() {
        const loader = document.createElement('div');
        loader.id = 'loader';
        loader.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.5);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;
        loader.innerHTML = `
            <div style="
                border: 5px solid #f3f3f3;
                border-top: 5px solid #009FB9;
                border-radius: 50%;
                width: 50px;
                height: 50px;
                animation: spin 1s linear infinite;
            "></div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        document.body.appendChild(loader);
        return loader;
    }

    // Función para mostrar mensajes
    function mostrarMensaje(texto, esError = false) {
        const mensaje = document.createElement('div');
        mensaje.textContent = texto;
        mensaje.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: ${esError ? '#f44336' : '#4CAF50'};
            color: white;
            padding: 15px;
            border-radius: 5px;
            z-index: 1000;
            animation: fadeIn 0.3s;
        `;
        
        document.body.appendChild(mensaje);
        
        setTimeout(() => {
            mensaje.style.animation = 'fadeOut 0.3s';
            setTimeout(() => mensaje.remove(), 300);
        }, 3000);
    }
});