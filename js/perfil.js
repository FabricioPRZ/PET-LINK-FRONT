// perfil.js
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const userIcon = document.querySelector('.user_icon');
    const userNameElement = document.querySelector('.inf-user p:nth-child(1)');
    const userUsernameElement = document.querySelector('.inf-user p:nth-child(3)');
    const userContactElement = document.querySelector('.inf-user p:nth-child(5)');
    const editProfileBtn = document.querySelector('a[href="#Editar perfil"]');
    const registrationRequestsBtn = document.querySelector('a[href="#Solicitudes de registro"]');
    const adoptionRequestsBtn = document.querySelector('a[href="#Solicitudes de adopción"]');
    const viewINEBtn = document.querySelector('a[href="INE.html"]');

    // Datos del usuario (simulados - en un caso real se obtendrían de la API)
    let userData = {
        id: null,
        nombres: '',
        apellido_paterno: '',
        apellido_materno: '',
        correo: '',
        tipo_usuario: '',
        INE: null
    };

    // Función para cargar los datos del usuario desde la API
    async function loadUserProfile() {
        try {
            // Obtener el ID del usuario de la sesión o localStorage
            const userId = localStorage.getItem('userId');
            if (!userId) {
                window.location.href = 'login.html'; // Redirigir si no hay sesión
                return;
            }

            // Hacer la petición a la API
            const response = await fetch(`http://localhost:8080/usuario/${userId}`);
            
            if (!response.ok) {
                throw new Error('Error al cargar los datos del usuario');
            }

            const data = await response.json();
            userData = data;

            // Actualizar la interfaz
            updateProfileUI();
        } catch (error) {
            console.error('Error:', error);
            alert('Error al cargar los datos del perfil');
        }
    }

    // Función para actualizar la interfaz con los datos del usuario
    function updateProfileUI() {
        userNameElement.textContent = `Nombre: ${userData.nombres} ${userData.apellido_paterno} ${userData.apellido_materno}`;
        userUsernameElement.textContent = `Nombre de usuario: ${userData.correo}`; // Usamos el correo como nombre de usuario
        userContactElement.textContent = `Información de contacto: ${userData.correo}`;
    }

    // Función para manejar la edición del perfil
    function setupEditProfile() {
        editProfileBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Crear formulario de edición
            const editForm = document.createElement('div');
            editForm.innerHTML = `
                <div class="edit-form" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;">
                    <div style="background: white; padding: 20px; border-radius: 10px; width: 500px;">
                        <h2 style="color: #009FB9; margin-bottom: 20px;">Editar Perfil</h2>
                        <form id="profileForm">
                            <div style="margin-bottom: 15px;">
                                <label style="display: block; margin-bottom: 5px; color: #053A42;">Nombres:</label>
                                <input type="text" id="editNombres" value="${userData.nombres}" style="width: 100%; padding: 8px; border: 1px solid #F08224; border-radius: 5px;">
                            </div>
                            <div style="margin-bottom: 15px;">
                                <label style="display: block; margin-bottom: 5px; color: #053A42;">Apellido Paterno:</label>
                                <input type="text" id="editApellidoPaterno" value="${userData.apellido_paterno}" style="width: 100%; padding: 8px; border: 1px solid #F08224; border-radius: 5px;">
                            </div>
                            <div style="margin-bottom: 15px;">
                                <label style="display: block; margin-bottom: 5px; color: #053A42;">Apellido Materno:</label>
                                <input type="text" id="editApellidoMaterno" value="${userData.apellido_materno}" style="width: 100%; padding: 8px; border: 1px solid #F08224; border-radius: 5px;">
                            </div>
                            <div style="margin-bottom: 15px;">
                                <label style="display: block; margin-bottom: 5px; color: #053A42;">Correo:</label>
                                <input type="email" id="editCorreo" value="${userData.correo}" style="width: 100%; padding: 8px; border: 1px solid #F08224; border-radius: 5px;">
                            </div>
                            <div style="margin-bottom: 15px;">
                                <label style="display: block; margin-bottom: 5px; color: #053A42;">Contraseña (dejar vacío para no cambiar):</label>
                                <input type="password" id="editPassword" style="width: 100%; padding: 8px; border: 1px solid #F08224; border-radius: 5px;">
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-top: 20px;">
                                <button type="button" id="cancelEdit" style="padding: 8px 15px; background: #F08224; color: white; border: none; border-radius: 5px; cursor: pointer;">Cancelar</button>
                                <button type="submit" style="padding: 8px 15px; background: #009FB9; color: white; border: none; border-radius: 5px; cursor: pointer;">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            
            document.body.appendChild(editForm);
            
            // Manejar el envío del formulario
            document.getElementById('profileForm').addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const updatedData = {
                    nombres: document.getElementById('editNombres').value,
                    apellido_paterno: document.getElementById('editApellidoPaterno').value,
                    apellido_materno: document.getElementById('editApellidoMaterno').value,
                    correo: document.getElementById('editCorreo').value
                };
                
                const newPassword = document.getElementById('editPassword').value;
                if (newPassword) {
                    updatedData.contraseña = newPassword;
                }
                
                try {
                    const response = await fetch(`http://localhost:8080/usuario/${userData.id_usuario}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(updatedData)
                    });
                    
                    if (!response.ok) {
                        throw new Error('Error al actualizar el perfil');
                    }
                    
                    // Actualizar los datos locales y la UI
                    userData = { ...userData, ...updatedData };
                    updateProfileUI();
                    
                    // Cerrar el formulario
                    document.body.removeChild(editForm);
                    alert('Perfil actualizado correctamente');
                } catch (error) {
                    console.error('Error:', error);
                    alert('Error al actualizar el perfil');
                }
            });
            
            // Manejar el botón de cancelar
            document.getElementById('cancelEdit').addEventListener('click', function() {
                document.body.removeChild(editForm);
            });
        });
    }

    // Función para manejar las solicitudes de registro
    function setupRegistrationRequests() {
        registrationRequestsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Aquí iría la lógica para mostrar las solicitudes de registro
            alert('Funcionalidad de solicitudes de registro en desarrollo');
        });
    }

    // Función para manejar las solicitudes de adopción
    function setupAdoptionRequests() {
        adoptionRequestsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Aquí iría la lógica para mostrar las solicitudes de adopción
            alert('Funcionalidad de solicitudes de adopción en desarrollo');
        });
    }

    // Función para manejar la visualización de la INE
    function setupViewINE() {
        viewINEBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // La INE se mostrará en la página INE.html
            // Podríamos pasar el ID del usuario como parámetro
            window.location.href = `INE.html?userId=${userData.id_usuario}`;
        });
    }

    // Inicialización
    loadUserProfile();
    setupEditProfile();
    setupRegistrationRequests();
    setupAdoptionRequests();
    setupViewINE();
});