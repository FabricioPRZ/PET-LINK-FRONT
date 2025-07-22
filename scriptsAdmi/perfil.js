// perfil.js - Versión corregida
document.addEventListener('DOMContentLoaded', async function() {
    // Verificar que el manejador de autenticación esté disponible
    if (!window.authManager) {
        console.error('AuthManager no está disponible. Asegúrate de incluir auth.js antes que perfil.js');
        mostrarError('Error del sistema. Por favor, recarga la página.');
        return;
    }

    await cargarPerfilUsuario();
});

async function cargarPerfilUsuario() {
    try {
        // Verificar autenticación usando el AuthManager
        if (!authManager.isAuthenticated()) {
            console.error('Usuario no autenticado');
            mostrarError('No se encontró sesión activa. Redirigiendo al login...');
            authManager.logout();
            return;
        }

        // Obtener el userId usando el AuthManager
        const userId = authManager.getUserId();
        
        if (!userId) {
            console.error('No se pudo obtener el ID del usuario');
            mostrarError('Error en la sesión. Por favor, inicia sesión nuevamente.');
            authManager.logout();
            return;
        }

        console.log('Cargando perfil para userId:', userId);

        // Realizar la petición usando authenticatedFetch
        const response = await authManager.authenticatedFetch(
            `http://44.208.231.53:7078/usuarios/${userId}`
        );

        if (!response.ok) {
            if (response.status === 401) {
                console.error('Token no válido o expirado');
                mostrarError('Sesión expirada. Redirigiendo al login...');
                authManager.logout();
                return;
            }
            throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
        }

        const usuario = await response.json();
        console.log('Datos del usuario cargados:', usuario);
        
        // Actualizar la interfaz con los datos del usuario
        actualizarInterfazUsuario(usuario);
        
    } catch (error) {
        console.error('Error al cargar el perfil del usuario:', error);
        
        // Si el error es por autenticación, redirigir al login
        if (error.message.includes('Token') || error.message.includes('autenticación')) {
            authManager.logout();
        } else {
            mostrarError('Error al cargar la información del usuario: ' + error.message);
        }
    }
}

function actualizarInterfazUsuario(usuario) {
    try {
        // Obtener los elementos donde se mostrará la información
        const infUserDiv = document.querySelector('.inf-user');
        
        if (!infUserDiv) {
            console.error('No se encontró el contenedor de información del usuario');
            return;
        }

        // Actualizar el contenido con la información del usuario
        // Ajusta los nombres de las propiedades según lo que devuelve tu API
        infUserDiv.innerHTML = `
            <p><strong>Nombre:</strong> ${usuario.nombres || usuario.name || 'No disponible'}</p>
            <br>
            <p><strong>Nombre de usuario:</strong> ${usuario.nombre_usuario || usuario.nombreUsuario || usuario.username || usuario.correo || 'No disponible'}</p>
            <br>
            <p><strong>Información de contacto:</strong> ${usuario.correo || usuario.email || usuario.telefono || usuario.phone || 'No disponible'}</p>
        `;

        // Si hay una imagen de perfil, actualizarla
        const userIcon = document.querySelector('.user_icon');
        if (userIcon && (usuario.fotoPerfil || usuario.foto_perfil || usuario.avatar)) {
            userIcon.src = usuario.fotoPerfil || usuario.foto_perfil || usuario.avatar;
            userIcon.alt = `Foto de perfil de ${usuario.nombre || 'Usuario'}`;
        }
        
        console.log('Interfaz actualizada correctamente');
        
    } catch (error) {
        console.error('Error al actualizar la interfaz:', error);
        mostrarError('Error al mostrar la información del usuario');
    }
}

function mostrarError(mensaje) {
    console.error('Mostrando error:', mensaje);
    
    // Mostrar error en la interfaz
    const infUserDiv = document.querySelector('.inf-user');
    if (infUserDiv) {
        infUserDiv.innerHTML = `
            <p style="color: red; font-weight: bold;">❌ Error: ${mensaje}</p>
            <br>
            <p>Por favor, intenta recargar la página o contacta al administrador.</p>
        `;
    }
    
    // También mostrar alerta
    alert(`❌ Error: ${mensaje}`);
}

// Función para recargar el perfil (útil si necesitas actualizar después de cambios)
async function recargarPerfil() {
    console.log('Recargando perfil...');
    await cargarPerfilUsuario();
}

// Función para cerrar sesión
function cerrarSesion() {
    if (confirm('¿Estás seguro que quieres cerrar sesión?')) {
        authManager.logout();
    }
}

// Hacer las funciones disponibles globalmente para debugging
window.recargarPerfil = recargarPerfil;
window.cerrarSesion = cerrarSesion;