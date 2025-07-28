document.addEventListener('DOMContentLoaded', async function () {
    try {
        document.querySelector('.cedente-info').innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <div class="spinner"></div>
                <p>Cargando perfil del cedente...</p>
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

        const token = localStorage.getItem('token');
        let userId = localStorage.getItem('userId');

        if (!userId || userId === 'null' || userId === 'undefined') {
            const jwtData = parseJWT(token);
            userId = jwtData?.id || jwtData?.userId || jwtData?.sub;
            if (userId) localStorage.setItem('userId', userId.toString());
        }

        if (!token || !userId) {
            throw new Error('Sesión inválida. Por favor inicie sesión nuevamente.');
        }

        const response = await fetch(`http://44.208.231.53:7078/usuarios/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.clear();
                throw new Error('La sesión ha expirado. Por favor inicie sesión nuevamente.');
            }
            throw new Error(`Error al cargar perfil del cedente: ${response.statusText}`);
        }

        const cedente = await response.json();
        mostrarDatosCedente(cedente);
    } catch (error) {
        mostrarErrorEnCedente(error.message);
    }
});

function mostrarDatosCedente(cedente) {
    const container = document.querySelector('.cedente-info');

    const nombre = [cedente.nombres, cedente.apellido_paterno, cedente.apellido_materno]
        .filter(Boolean).join(' ') || 'No especificado';

    container.innerHTML = `
        <div class="info-field">
            <span class="field-label">Nombre del cedente:</span>
            <span class="field-value">${nombre}</span>
        </div>
        <div class="info-field">
            <span class="field-label">Correo electrónico:</span>
            <span class="field-value">${cedente.correo || 'No especificado'}</span>
        </div>
        <div class="info-field">
            <span class="field-label">Teléfono:</span>
            <span class="field-value">${cedente.telefono || 'No especificado'}</span>
        </div>
        <div class="info-field">
            <span class="field-label">Estado:</span>
            <span class="field-value">${cedente.estado || 'No especificado'}</span>
        </div>
    `;

}

function mostrarErrorEnCedente(mensaje) {
    const container = document.querySelector('.cedente-info');
    container.innerHTML = `
        <div style="text-align: center; padding: 20px; color: #d32f2f;">
            <h3>Error al cargar el perfil del cedente</h3>
            <p>${mensaje}</p>
            <div style="margin-top: 15px;">
                <button onclick="location.reload()">Reintentar</button>
                <button onclick="localStorage.clear(); window.location.href='/login.html'">Ir a Login</button>
            </div>
        </div>
    `;
}

function parseJWT(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error decodificando JWT:', error);
        return null;
    }
}