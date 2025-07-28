// ine.js - Gestión de identificación del usuario

// Configuración
const API_BASE_URL = 'http://44.208.231.53:7078';

// Elementos del DOM
const imgElement = document.getElementById('INE-img');
const btnActualizar = document.getElementById('btn-actualizar');
const inputFile = document.getElementById('input-file');
const modalConfirmar = document.getElementById('modal-confirmar');
const previewImg = document.getElementById('preview-img');
const btnConfirmar = document.getElementById('btn-confirmar');
const btnCancelar = document.getElementById('btn-cancelar');

// Estado de la aplicación
let currentUserId = null;
let currentToken = null;
let currentINE = null;

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await initINE();
    } catch (error) {
        console.error('Error inicializando:', error);
        showError('Error al cargar la página. Por favor recarga.');
    }
});

async function initINE() {
    // 1. Verificar autenticación
    currentToken = localStorage.getItem('token');
    currentUserId = localStorage.getItem('userId');
    
    if (!currentToken || !currentUserId) {
        showError('No autenticado. Redirigiendo...');
        setTimeout(() => window.location.href = '/login.html', 2000);
        return;
    }

    // 2. Configurar eventos
    setupEventListeners();

    // 3. Cargar datos
    await loadUserData();
}

async function loadUserData() {
    showLoadingState();
    
    try {
        // 1. Obtener datos del usuario
        const userData = await fetchUserData();
        currentINE = userData.ine || null;
        
        // 2. Mostrar INE si existe
        if (currentINE) {
            displayINEImage();
        } else {
            showNoINEState();
        }
    } catch (error) {
        console.error('Error cargando datos:', error);
        showError(error.message);
    }
}

async function fetchUserData() {
    const response = await fetch(`${API_BASE_URL}/usuarios/${currentUserId}`, {
        headers: {
            'Authorization': `Bearer ${currentToken}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        if (response.status === 401) {
            localStorage.clear();
            throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
        }
        throw new Error('Error al obtener datos del usuario');
    }

    return await response.json();
}

function displayINEImage() {
    // Construir la URL completa de la imagen
    const imageUrl = `${API_BASE_URL}${currentINE}`;
    
    imgElement.src = imageUrl;
    imgElement.alt = 'Identificación del usuario';
    imgElement.style.maxHeight = '500px';
    imgElement.style.objectFit = 'contain';
    
    // Manejar error si la imagen no carga
    imgElement.onerror = () => {
        showError('No se pudo cargar la imagen de identificación');
        showNoINEState();
    };
}

function setupEventListeners() {
    // Botón de actualización
    btnActualizar.addEventListener('click', () => inputFile.click());

    // Selección de archivo
    inputFile.addEventListener('change', handleFileSelect);

    // Botones del modal
    btnConfirmar.addEventListener('click', handleConfirmUpdate);
    btnCancelar.addEventListener('click', () => {
        modalConfirmar.style.display = 'none';
        inputFile.value = '';
    });
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validaciones
    if (!file.type.match('image.*') && file.type !== 'application/pdf') {
        showError('Solo se permiten imágenes (JPEG, PNG) o archivos PDF');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB
        showError('El archivo no debe exceder 5MB');
        return;
    }

    // Vista previa
    if (file.type.match('image.*')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            modalConfirmar.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        previewImg.src = '/src/public/otros/pdf_icon.svg';
        modalConfirmar.style.display = 'block';
    }
}

async function handleConfirmUpdate() {
    try {
        btnConfirmar.disabled = true;
        btnConfirmar.innerHTML = 'Subiendo...';

        const formData = new FormData();
        formData.append('ine', inputFile.files[0]);

        // Endpoint para subir INE (ajusta según tu API)
        const response = await fetch(`${API_BASE_URL}/usuarios/${currentUserId}/ine`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${currentToken}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('Error al subir la identificación');
        }

        // Actualizar datos del usuario después de subir
        const updatedUser = await response.json();
        currentINE = updatedUser.ine;
        
        // Mostrar la nueva imagen
        displayINEImage();
        showSuccess('Identificación actualizada correctamente');
        
    } catch (error) {
        console.error('Error actualizando INE:', error);
        showError(error.message);
    } finally {
        modalConfirmar.style.display = 'none';
        inputFile.value = '';
        btnConfirmar.disabled = false;
        btnConfirmar.innerHTML = 'Confirmar';
    }
}

// Funciones de ayuda para estados UI
function showLoadingState() {
    imgElement.src = '/src/public/otros/loading_INE.svg';
    imgElement.alt = 'Cargando identificación...';
}

function showNoINEState() {
    imgElement.src = '/src/public/otros/no_INE.svg';
    imgElement.alt = 'No hay identificación registrada';
    btnActualizar.textContent = 'Subir identificación';
}

function showError(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.innerHTML = `
        <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="#d32f2f" d="M11,15H13V17H11V15M11,7H13V13H11V7M12,2C6.47,2,2,6.5,2,12A10,10,0,0,0,12,22A10,10,0,0,0,22,12A10,10,0,0,0,12,2M12,20A8,8,0,0,1,4,12A8,8,0,0,1,12,4A8,8,0,0,1,20,12A8,8,0,0,1,12,20Z"/>
        </svg>
        <span>${message}</span>
    `;
    
    errorElement.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        display: flex;
        align-items: center;
        padding: 12px;
        background-color: #ffebee;
        color: #d32f2f;
        border-radius: 4px;
        border-left: 4px solid #d32f2f;
        font-size: 14px;
        z-index: 1000;
        animation: fadeIn 0.3s ease-in-out;
    `;
    
    document.body.appendChild(errorElement);
    setTimeout(() => errorElement.remove(), 5000);
}

function showSuccess(message) {
    const successElement = document.createElement('div');
    successElement.className = 'success-message';
    successElement.innerHTML = `
        <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="#4CAF50" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
        </svg>
        <span>${message}</span>
    `;
    
    successElement.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        display: flex;
        align-items: center;
        padding: 12px;
        background-color: #e8f5e9;
        color: #4CAF50;
        border-radius: 4px;
        border-left: 4px solid #4CAF50;
        font-size: 14px;
        z-index: 1000;
        animation: fadeIn 0.3s ease-in-out;
    `;
    
    document.body.appendChild(successElement);
    setTimeout(() => successElement.remove(), 5000);
}

// Estilos dinámicos
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    .spinner {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255,255,255,0.3);
        border-radius: 50%;
        border-top-color: #fff;
        animation: spin 1s ease-in-out infinite;
        margin-right: 8px;
        vertical-align: middle;
    }
`;
document.head.appendChild(style);