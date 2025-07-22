// auth.js - Manejador de autenticación global
class AuthManager {
    constructor() {
        this.baseURL = 'http://44.208.231.53:7078';
    }

    // Verificar si el usuario está autenticado
    isAuthenticated() {
        const token = this.getToken();
        if (!token) return false;
        
        // Verificar si el token no ha expirado
        return !this.isTokenExpired(token);
    }

    // Obtener el token del localStorage
    getToken() {
        return localStorage.getItem('jwt');
    }

    // Obtener el userId del localStorage o del token
    getUserId() {
        // Primero intentar desde localStorage
        const userId = localStorage.getItem('userId');
        if (userId) return userId;

        // Si no está, intentar extraerlo del token
        const token = this.getToken();
        if (token) {
            return this.getUserIdFromToken(token);
        }

        return null;
    }

    // Extraer userId del token JWT
    getUserIdFromToken(token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.userId || payload.id || payload.sub || payload.usuario_id;
        } catch (error) {
            console.error('Error al decodificar el token:', error);
            return null;
        }
    }

    // Verificar si el token ha expirado
    isTokenExpired(token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const now = Date.now() / 1000;
            return payload.exp < now;
        } catch (error) {
            console.error('Error al verificar expiración del token:', error);
            return true;
        }
    }

    // Obtener datos del usuario desde localStorage
    getUserData() {
        const userData = localStorage.getItem('userData');
        return userData ? JSON.parse(userData) : null;
    }

    // Obtener tipo de usuario
    getUserType() {
        return localStorage.getItem('tipo_usuario') || 'user';
    }

    // Hacer petición con autenticación
    async authenticatedFetch(url, options = {}) {
        const token = this.getToken();
        
        if (!token) {
            throw new Error('No hay token de autenticación');
        }

        if (this.isTokenExpired(token)) {
            this.logout();
            throw new Error('Token expirado');
        }

        // Agregar el token a los headers
        const authOptions = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                ...options.headers
            }
        };

        const response = await fetch(url, authOptions);

        // Si la respuesta es 401 (No autorizado), hacer logout
        if (response.status === 401) {
            this.logout();
            throw new Error('Token no válido');
        }

        return response;
    }

    // Cerrar sesión
    logout() {
        localStorage.removeItem('jwt');
        localStorage.removeItem('userId');
        localStorage.removeItem('userData');
        localStorage.removeItem('tipo_usuario');
        
        // Redirigir al login
        window.location.href = '/login.html';
    }

    // Verificar autenticación al cargar página
    checkAuthOnPageLoad() {
        if (!this.isAuthenticated()) {
            console.warn('Usuario no autenticado, redirigiendo al login...');
            this.logout();
            return false;
        }
        return true;
    }

    // Verificar si el usuario es admin
    isAdmin() {
        return this.getUserType() === 'admin';
    }
}

// Crear instancia global
const authManager = new AuthManager();

// Verificar autenticación automáticamente en páginas protegidas
document.addEventListener('DOMContentLoaded', () => {
    // Solo verificar en páginas que no sean login o registro
    const currentPage = window.location.pathname;
    const publicPages = ['/login.html', '/registro.html', '/index.html', '/'];
    
    const isPublicPage = publicPages.some(page => 
        currentPage === page || currentPage.endsWith(page)
    );

    if (!isPublicPage) {
        authManager.checkAuthOnPageLoad();
    }
});

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}

// Hacer disponible globalmente
window.authManager = authManager;