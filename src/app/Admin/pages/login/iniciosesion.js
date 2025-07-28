// Función para decodificar JWT
function parseJWT(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error decodificando JWT:', error);
        return null;
    }
}

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Obtener valores del formulario
    const correo = document.getElementById('correo').value.trim();
    const contraseña = document.getElementById('contraseña').value;
    const recordar = document.getElementById('recordar').checked;

    // Validación básica de campos
    if (!correo || !contraseña) {
        mostrarError('Por favor complete todos los campos');
        return;
    }

    try {
        // Configurar estado de carga
        const botonLogin = document.querySelector('#loginForm button[type="submit"]');
        botonLogin.disabled = true;
        botonLogin.innerHTML = '<span class="loader"></span> Iniciando sesión...';

        // Enviar petición al servidor
        const response = await fetch('http://44.208.231.53:7078/usuarios/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                correo: correo,
                contraseña: contraseña
            })
        });

        // Procesar respuesta
        let responseData;
        try {
            responseData = await response.json();
        } catch (jsonError) {
            console.error('Error parseando JSON:', jsonError);
            throw new Error('La respuesta del servidor no es válida');
        }

        console.log('Respuesta completa del servidor:', responseData);
        console.log('Estructura del usuario:', responseData.usuario);

        // Validar estructura de la respuesta
        if (!responseData || typeof responseData !== 'object') {
            throw new Error('El servidor no devolvió datos válidos');
        }

        // Manejar errores del servidor
        if (!response.ok) {
            const errorMessage = responseData.message || 
                               responseData.error ||
                               `Error ${response.status}: ${response.statusText}`;
            throw new Error(errorMessage);
        }

        // Validar campos esenciales
        if (!responseData.token || !responseData.usuario) {
            throw new Error('Faltan datos esenciales en la respuesta del servidor');
        }

        const requiredUserFields = ['correo'];
        const missingFields = requiredUserFields.filter(field => !responseData.usuario[field]);
        
        if (missingFields.length > 0) {
            throw new Error('Datos de usuario incompletos');
        }

        // Validar rol de usuario
        const rolesPermitidos = ['administrador', 'cedente'];
        if (!rolesPermitidos.includes(responseData.usuario.tipo_usuario)) {
            throw new Error('Rol de usuario no reconocido');
        }

        // Guardar token primero
        localStorage.setItem('token', responseData.token);

        // Extraer datos del JWT
        const jwtData = parseJWT(responseData.token);
        console.log('Datos extraídos del JWT:', jwtData);

        // Obtener userId de múltiples fuentes posibles
        let userId = null;

        // Intentar desde responseData.usuario
        if (responseData.usuario) {
            userId = responseData.usuario.id_usuario || 
                     responseData.usuario.id || 
                     responseData.usuario.userId || 
                     responseData.usuario.user_id;
        }

        // Si no se encontró, intentar desde JWT
        if (!userId && jwtData) {
            userId = jwtData.id || jwtData.userId;
            // Si sub es numérico, usarlo como ID
            if (!userId && jwtData.sub && !isNaN(jwtData.sub)) {
                userId = jwtData.sub;
            }
        }

        console.log('UserId encontrado:', userId);

        if (!userId) {
            console.error('No se pudo encontrar userId en:', {
                usuario: responseData.usuario,
                jwt: jwtData
            });
            throw new Error('No se pudo obtener el ID del usuario del servidor');
        }

        // Guardar todos los datos
        localStorage.setItem('userId', userId.toString());
        localStorage.setItem('userData', JSON.stringify(responseData.usuario));
        localStorage.setItem('userRole', responseData.usuario.tipo_usuario);

        // Verificación inmediata
        const verificacion = {
            token: localStorage.getItem('token'),
            userId: localStorage.getItem('userId'),
            userData: localStorage.getItem('userData'),
            userRole: localStorage.getItem('userRole')
        };

        console.log('Datos guardados y verificados en localStorage:', verificacion);

        // Verificar que userId no sea null o undefined
        if (!localStorage.getItem('userId') || localStorage.getItem('userId') === 'null') {
            throw new Error('Error: userId no se guardó correctamente');
        }

        // Configurar redirección
        const redirectPaths = {
            'administrador': '/src/app/Admin/pages/adopcion/adoptar_admin.html',
            'cedente': '/src/app/Admin/pages/pages/dashboard.html'
        };
        
        const redirectPath = redirectPaths[responseData.usuario.tipo_usuario] || '/perfil.html';
        
        // Opción "Recordar email"
        if (recordar) {
            localStorage.setItem('rememberedEmail', correo);
        } else {
            localStorage.removeItem('rememberedEmail');
        }

        // Redirigir con pequeño delay
        setTimeout(() => {
            window.location.href = redirectPath;
        }, 500);

    } catch (error) {
        console.error('Error en login:', error);
        const errorMessage = error.message.includes('servidor') ? 
            'Error en el servidor. Por favor intente más tarde.' : 
            error.message;
        
        mostrarError(errorMessage);
    } finally {
        // Restaurar estado del botón
        const botonLogin = document.querySelector('#loginForm button[type="submit"]');
        if (botonLogin) {
            botonLogin.disabled = false;
            botonLogin.textContent = 'Iniciar Sesión';
        }
    }
});

function mostrarError(mensaje) {
    // Limpiar errores anteriores
    const erroresAnteriores = document.querySelectorAll('.error-message');
    erroresAnteriores.forEach(el => el.remove());
    
    // Crear elemento de error
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.innerHTML = `
        <svg viewBox="0 0 24 24" width="20" height="20" style="vertical-align: middle; margin-right: 8px;">
            <path fill="#d32f2f" d="M11,15H13V17H11V15M11,7H13V13H11V7M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20Z"/>
        </svg>
        <span>${mensaje}</span>
    `;
    
    // Estilos del error
    errorElement.style.cssText = `
        display: flex;
        align-items: center;
        padding: 12px;
        margin: 16px 0;
        background-color: #ffebee;
        color: #d32f2f;
        border-radius: 4px;
        border-left: 4px solid #d32f2f;
        font-size: 14px;
        animation: fadeIn 0.3s ease-in-out;
    `;
    
    // Agregar estilos dinámicamente
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);
    
    // Insertar en el formulario
    const formulario = document.getElementById('loginForm');
    if (formulario) {
        formulario.prepend(errorElement);
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Cargar email recordado al iniciar la página
window.addEventListener('DOMContentLoaded', function() {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
        document.getElementById('correo').value = rememberedEmail;
        document.getElementById('recordar').checked = true;
    }
});