document.addEventListener('DOMContentLoaded', async function() {
    const userId = obtenerIdUsuario();
    
    await cargarDatosUsuario(userId);
    agregarEventListenersABotones();
    configurarModal();
});

// Función para obtener el ID del usuario
function obtenerIdUsuario() {
    const urlParams = new URLSearchParams(window.location.search);
    const userIdFromUrl = urlParams.get('userId');
    const userIdFromStorage = localStorage.getItem('userId');
    const userIdFromSession = sessionStorage.getItem('userId');
    return userIdFromUrl || userIdFromStorage || userIdFromSession || 1;
}

// Función para cargar los datos del usuario
async function cargarDatosUsuario(userId) {
    try {
        mostrarCargando(true);
        
        const response = await fetch(`http://44.208.231.53:7078/usuarios/${userId}`);
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const userData = await response.json();
        
        mostrarDatosEnPerfil(userData);
        precargarFormularioEdicion(userData);
        
    } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
        mostrarError('No se pudieron cargar los datos del perfil. Inténtalo de nuevo.');
    } finally {
        mostrarCargando(false);
    }
}

// Función para mostrar los datos en el perfil
function mostrarDatosEnPerfil(userData) {
    const infUser = document.querySelector('.inf-user');
    
    const nombreCompleto = `${userData.nombres} ${userData.apellido_paterno} ${userData.apellido_materno || ''}`.trim();
    
    infUser.innerHTML = `
        <p>Nombre: <span style="color: #F08224;">${nombreCompleto}</span></p>
        <br>
        <p>Correo: <span style="color: #F08224;">${userData.correo}</span></p>
        <br>
        <p>Estado: <span style="color: #F08224;">Usuario ${userData.tipo_usuario === 'user' ? 'Regular' : 'Administrador'}</span></p>
    `;
}

// Función para precargar el formulario de edición
function precargarFormularioEdicion(userData) {
    document.getElementById('nombres').value = userData.nombres || '';
    document.getElementById('apellido_paterno').value = userData.apellido_paterno || '';
    document.getElementById('apellido_materno').value = userData.apellido_materno || '';
    document.getElementById('correo').value = userData.correo || '';
}

// Función para mostrar estado de carga
function mostrarCargando(mostrar) {
    const infUser = document.querySelector('.inf-user');
    
    if (mostrar) {
        infUser.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 200px;">
                <div style="color: #009FB9; font-size: 24px;">
                    Cargando datos del perfil...
                </div>
            </div>
        `;
    }
}

// Función para mostrar errores
function mostrarError(mensaje) {
    const infUser = document.querySelector('.inf-user');
    
    infUser.innerHTML = `
        <div style="color: #f44336; font-size: 24px; text-align: center;">
            <p>❌ ${mensaje}</p>
            <br>
            <button onclick="location.reload()" style="
                background-color: #009FB9; 
                color: white; 
                border: none; 
                padding: 10px 20px; 
                border-radius: 5px; 
                cursor: pointer;
                font-size: 16px;
            ">
                Reintentar
            </button>
        </div>
    `;
}

// Función para configurar los listeners de los botones
function agregarEventListenersABotones() {
    const btnVerINE = document.querySelector('a[href="INE.html"]');
    if (btnVerINE) {
        btnVerINE.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = `INE.html?userId=${obtenerIdUsuario()}`;
        });
    }
    
    const botonesOpciones = document.querySelectorAll('.opciones-perfil a');
    botonesOpciones.forEach(boton => {
        if (!boton.href.includes('INE.html')) {
            boton.addEventListener('click', function(e) {
                e.preventDefault();
                const accion = this.getAttribute('data-accion');
                
                if (accion === 'editar') {
                    abrirModal();
                } else {
                    console.log(`Acción seleccionada: ${accion}`);
                    mostrarMensajeTemporal(`Función "${accion}" en desarrollo`);
                }
            });
        }
    });
}

// Función para configurar el modal
function configurarModal() {
    const modal = document.getElementById('modal-editar');
    const btnCerrar = document.querySelector('.cerrar-modal');
    const btnCancelar = document.querySelector('.btn-cancelar');
    const form = document.getElementById('form-editar-perfil');
    
    // Función para abrir el modal
    window.abrirModal = function() {
        modal.style.display = 'block';
    }
    
    // Función para cerrar el modal
    function cerrarModal() {
        modal.style.display = 'none';
    }
    
    // Event listeners para cerrar el modal
    btnCerrar.addEventListener('click', cerrarModal);
    btnCancelar.addEventListener('click', cerrarModal);
    
    // Cerrar al hacer clic fuera del modal
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            cerrarModal();
        }
    });
    
    // Manejar envío del formulario
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        await guardarCambios();
    });
}

// Función para guardar los cambios del perfil
async function guardarCambios() {
    try {
        const userId = obtenerIdUsuario();
        const formData = {
            nombres: document.getElementById('nombres').value,
            apellido_paterno: document.getElementById('apellido_paterno').value,
            apellido_materno: document.getElementById('apellido_materno').value,
            correo: document.getElementById('correo').value
        };
        
        const response = await fetch(`http://44.208.231.53:7078/usuarios/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        mostrarMensajeTemporal('Cambios guardados exitosamente');
        document.querySelector('.cerrar-modal').click();
        
        // Recargar datos del perfil
        await cargarDatosUsuario(userId);
        
    } catch (error) {
        console.error('Error al guardar cambios:', error);
        mostrarMensajeTemporal('Error al guardar cambios', true);
    }
}

// Función para mostrar mensajes temporales
function mostrarMensajeTemporal(mensaje, esError = false) {
    const div = document.createElement('div');
    div.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: ${esError ? '#f44336' : '#009FB9'};
        color: white;
        padding: 15px;
        border-radius: 5px;
        z-index: 1000;
        font-family: 'Poppins', sans-serif;
    `;
    div.textContent = mensaje;
    document.body.appendChild(div);
    
    setTimeout(() => {
        div.remove();
    }, 3000);
}