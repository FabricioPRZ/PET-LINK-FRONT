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

document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Mostrar estado de carga
        document.querySelector('.profile-info').innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <div class="spinner"></div>
                <p>Cargando perfil...</p>
            </div>
            <style>
                .spinner {
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #4a6fa5;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    animation: spin 1s linear infinite;
                    margin: 0 auto;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;

        // Verificar datos de sesión con más detalle
        const token = localStorage.getItem('token');
        let userId = localStorage.getItem('userId');
        
        console.log('Verificación inicial:', {
            token: token ? 'Presente' : 'Ausente',
            userId: userId,
            userIdType: typeof userId,
            tokenLength: token ? token.length : 0
        });

        // Si userId es null, intentar extraerlo del JWT
        if (!userId || userId === 'null' || userId === 'undefined') {
            console.log('Intentando extraer userId del JWT...');
            if (token) {
                const jwtData = parseJWT(token);
                console.log('Datos completos del JWT:', jwtData);
                
                if (jwtData) {
                    // Intentar diferentes campos para el ID
                    userId = jwtData.id || jwtData.userId || jwtData.user_id;
                    
                    // Si sub es numérico, usarlo como ID
                    if (!userId && jwtData.sub && !isNaN(jwtData.sub)) {
                        userId = jwtData.sub;
                    }
                    
                    if (userId) {
                        localStorage.setItem('userId', userId.toString());
                        console.log('UserId extraído del JWT y guardado:', userId);
                    }
                }
            }
        }

        console.log('Datos recuperados de localStorage:', { 
            token: token ? 'Presente' : 'Ausente', 
            userId: userId,
            userData: localStorage.getItem('userData'),
            userRole: localStorage.getItem('userRole')
        });

        if (!token) {
            throw new Error('No se encontró token de sesión. Por favor inicie sesión nuevamente.');
        }

        if (!userId || userId === 'null' || userId === 'undefined') {
            // Intentar usar datos del JWT como último recurso
            const jwtData = parseJWT(token);
            if (jwtData && jwtData.id) {
                userId = jwtData.id;
                localStorage.setItem('userId', userId.toString());
            } else {
                localStorage.clear(); // Limpiar datos corruptos
                throw new Error('No se encontró ID de usuario válido. Por favor inicie sesión nuevamente.');
            }
        }

        console.log('UserId final a usar:', userId);

        // Cargar datos del perfil
        const response = await fetch(`http://44.208.231.53:7078/usuarios/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Respuesta del servidor:', response.status, response.statusText);

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.clear();
                throw new Error('La sesión ha expirado. Por favor inicie sesión nuevamente.');
            }
            if (response.status === 404) {
                throw new Error('Usuario no encontrado. Verifique sus credenciales.');
            }
            throw new Error(`Error al cargar perfil: ${response.status} ${response.statusText}`);
        }

        const usuario = await response.json();
        console.log('Datos del usuario recibidos:', usuario);
        
        if (!usuario) {
            throw new Error('No se recibieron datos del usuario desde el servidor');
        }

        // Mostrar datos del usuario
        mostrarDatosUsuario(usuario);

    } catch (error) {
        console.error('Error al cargar el perfil:', error);
        mostrarErrorEnPerfil(error.message);
    } finally {
        // Inicializar eventos después de cargar
        configurarEventosEdicion();
    }
});

function mostrarDatosUsuario(usuario) {
    const profileInfo = document.querySelector('.profile-info');
    
    // Construir el nombre completo
    const nombreCompleto = [
        usuario.nombres || '',
        usuario.apellido_paterno || '',
        usuario.apellido_materno || ''
    ].filter(name => name.trim()).join(' ') || 'No especificado';

    profileInfo.innerHTML = `
        <div class="info-field">
            <span class="field-label">Nombre completo:</span>
            <span class="field-value">${nombreCompleto}</span>
        </div>
        <div class="info-field">
            <span class="field-label">Tipo de usuario:</span>
            <span class="field-value">${usuario.tipo_usuario || 'No especificado'}</span>
        </div>
        <div class="info-field">
            <span class="field-label">Edad:</span>
            <span class="field-value">${usuario.edad ? usuario.edad + ' años' : 'No especificada'}</span>
        </div>
        <div class="info-field">
            <span class="field-label">Correo:</span>
            <span class="field-value">${usuario.correo || 'No especificado'}</span>
        </div>
        <div class="info-field">
            <span class="field-label">INE:</span>
            <span class="field-value" style="color: ${usuario.ine ? '#4CAF50' : '#F44336'}">
                ${usuario.ine ? 'Verificada' : 'No verificada'}
            </span>
        </div>
    `;

    // Llenar formulario de edición si existe
    if (document.getElementById('nombres')) {
        document.getElementById('nombres').value = usuario.nombres || '';
        document.getElementById('apellido_paterno').value = usuario.apellido_paterno || '';
        document.getElementById('apellido_materno').value = usuario.apellido_materno || '';
        document.getElementById('correo').value = usuario.correo || '';
    }
    
    // Configurar enlace para ver INE
    const enlaceINE = document.querySelector('.view-id');
    if (enlaceINE) {
        if (!usuario.ine) {
            enlaceINE.onclick = (e) => {
                e.preventDefault();
                alert('No hay documento INE registrado');
            };
        }
        // No modificamos el href para mantener la ruta original
    }
}

function mostrarErrorEnPerfil(mensaje) {
    const profileInfo = document.querySelector('.profile-info');
    profileInfo.innerHTML = `
        <div style="
            text-align: center;
            padding: 20px;
            color: #d32f2f;
            background-color: #ffebee;
            border-radius: 4px;
            margin: 10px;
            border-left: 4px solid #d32f2f;
        ">
            <h3 style="margin-top: 0;">Error al cargar el perfil</h3>
            <p style="margin: 10px 0;">${mensaje}</p>
            <div style="margin-top: 15px;">
                <button onclick="location.reload()" style="
                    margin: 5px;
                    padding: 8px 16px;
                    background: #4a6fa5;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                ">
                    Reintentar
                </button>
                <button onclick="localStorage.clear(); window.location.href='/login.html'" style="
                    margin: 5px;
                    padding: 8px 16px;
                    background: #f44336;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                ">
                    Ir a Login
                </button>
            </div>
        </div>
    `;
}

function configurarEventosEdicion() {
    // Modal de edición
    const editButton = document.querySelector('.edit-profile');
    if (editButton) {
        editButton.addEventListener('click', () => {
            const modal = document.getElementById('modal-editar');
            if (modal) modal.style.display = 'block';
        });
    }

    // Cerrar modal
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = document.getElementById('modal-editar');
            if (modal) modal.style.display = 'none';
        });
    });

    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('modal-editar');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Formulario de edición
    const editForm = document.getElementById('form-editar-perfil');
    if (editForm) {
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            try {
                const usuarioId = localStorage.getItem('userId');
                const token = localStorage.getItem('token');
                
                if (!usuarioId || !token) {
                    throw new Error('Sesión no válida');
                }

                // Deshabilitar botón de envío
                const submitButton = e.target.querySelector('button[type="submit"]');
                const originalText = submitButton.innerHTML;
                submitButton.disabled = true;
                submitButton.innerHTML = '<span>⏳</span> Guardando...';

                const response = await fetch(`http://44.208.231.53:7078/usuarios/${usuarioId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        nombres: document.getElementById('nombres').value.trim(),
                        apellido_paterno: document.getElementById('apellido_paterno').value.trim(),
                        apellido_materno: document.getElementById('apellido_materno').value.trim(),
                        correo: document.getElementById('correo').value.trim()
                    })
                });
                
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
                }

                const updatedUser = await response.json();
                console.log('Usuario actualizado:', updatedUser);

                // Cerrar modal
                const modal = document.getElementById('modal-editar');
                if (modal) modal.style.display = 'none';
                
                // Mostrar mensaje de éxito
                mostrarMensajeExito('Perfil actualizado correctamente');
                
                // Recargar datos después de 1 segundo
                setTimeout(() => {
                    location.reload();
                }, 1000);
                
            } catch (error) {
                console.error('Error al actualizar:', error);
                alert(`Error al guardar cambios: ${error.message}`);
            } finally {
                // Restaurar botón
                const submitButton = e.target.querySelector('button[type="submit"]');
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalText;
                }
            }
        });
    }
}

function mostrarMensajeExito(mensaje) {
    const existingMessage = document.querySelector('.success-message');
    if (existingMessage) existingMessage.remove();
    
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.innerHTML = `
        <div style="
            color: #4CAF50;
            background-color: #e8f5e9;
            padding: 15px;
            border-radius: 4px;
            margin: 10px;
            text-align: center;
            border-left: 4px solid #4CAF50;
            animation: fadeIn 0.3s ease-in-out;
        ">
            <strong>✓ ${mensaje}</strong>
        </div>
    `;
    
    const profileCard = document.querySelector('.profile-card');
    if (profileCard) {
        profileCard.prepend(successMessage);
        
        // Eliminar mensaje después de 3 segundos
        setTimeout(() => {
            successMessage.remove();
        }, 3000);
    }
}