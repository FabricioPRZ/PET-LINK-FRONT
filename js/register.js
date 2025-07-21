document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registroForm');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault(); 
        
        const nombres = document.getElementById('nombres').value.trim();
        const apellidoPaterno = document.getElementById('apellido_paterno').value.trim();
        const apellidoMaterno = document.getElementById('apellido_materno').value.trim();
        const correo = document.getElementById('correo').value.trim();
        const contraseña = document.getElementById('contraseña').value;
        const confirmarContraseña = document.getElementById('confirmar_contraseña').value;
        const fotoIne = document.getElementById('foto_ine').files[0];
        
        if (!validarFormulario(nombres, apellidoPaterno, apellidoMaterno, correo, contraseña, confirmarContraseña, fotoIne)) {
            return;
        }
        
        const formData = new FormData();
        formData.append('tipo_usuario', 'user'); 
        formData.append('nombres', nombres);
        formData.append('apellido_materno', apellidoMaterno);
        formData.append('apellido_paterno', apellidoPaterno);
        formData.append('correo', correo);
        formData.append('contraseña', contraseña);
        formData.append('ine', fotoIne); 
        
        try {
            mostrarCargando(true);
            
            const response = await fetch('http://44.208.231.53:7078/usuarios', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (response.ok) {
                mostrarMensaje('¡Registro exitoso! Bienvenido a PetLink', 'success');
                form.reset(); 
                
                setTimeout(() => {
                    window.location.href = '/login'; 
                }, 2000);
                
            } else {
                mostrarMensaje(result.message || 'Error en el registro. Inténtalo de nuevo.', 'error');
            }
            
        } catch (error) {
            console.error('Error:', error);
            mostrarMensaje('Error de conexión. Verifica tu conexión a internet.', 'error');
        } finally {
            mostrarCargando(false);
        }
    });
});

function validarFormulario(nombres, apellidoPaterno, apellidoMaterno, correo, contraseña, confirmarContraseña, fotoIne) {
    if (!nombres || !apellidoPaterno || !apellidoMaterno || !correo || !contraseña || !confirmarContraseña) {
        mostrarMensaje('Todos los campos son obligatorios', 'error');
        return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
        mostrarMensaje('Por favor, introduce un correo electrónico válido', 'error');
        return false;
    }
    
    if (contraseña !== confirmarContraseña) {
        mostrarMensaje('Las contraseñas no coinciden', 'error');
        return false;
    }
    
    if (contraseña.length < 6) {
        mostrarMensaje('La contraseña debe tener al menos 6 caracteres', 'error');
        return false;
    }
    
    if (!fotoIne) {
        mostrarMensaje('Debes adjuntar una foto de tu INE', 'error');
        return false;
    }
    
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!tiposPermitidos.includes(fotoIne.type)) {
        mostrarMensaje('Solo se permiten archivos JPG, JPEG y PNG para la foto del INE', 'error');
        return false;
    }
    
    const maxSize = 5 * 1024 * 1024; 
    if (fotoIne.size > maxSize) {
        mostrarMensaje('El archivo del INE no debe superar los 5MB', 'error');
        return false;
    }
    
    return true;
}

function mostrarMensaje(mensaje, tipo) {
    const mensajeAnterior = document.querySelector('.mensaje-usuario');
    if (mensajeAnterior) {
        mensajeAnterior.remove();
    }
    
    const divMensaje = document.createElement('div');
    divMensaje.className = `mensaje-usuario ${tipo}`;
    divMensaje.textContent = mensaje;
    
    divMensaje.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        max-width: 300px;
        word-wrap: break-word;
        ${tipo === 'success' ? 'background-color: #4CAF50;' : 'background-color: #f44336;'}
    `;
    
    document.body.appendChild(divMensaje);
    
    setTimeout(() => {
        if (divMensaje) {
            divMensaje.remove();
        }
    }, 5000);
}

function mostrarCargando(mostrar) {
    const botonSubmit = document.querySelector('button[type="submit"]');
    
    if (mostrar) {
        botonSubmit.disabled = true;
        botonSubmit.textContent = 'Registrando...';
        botonSubmit.style.opacity = '0.7';
    } else {
        botonSubmit.disabled = false;
        botonSubmit.textContent = 'Registrarse';
        botonSubmit.style.opacity = '1';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const contraseña = document.getElementById('contraseña');
    const confirmarContraseña = document.getElementById('confirmar_contraseña');
    
    confirmarContraseña.addEventListener('input', function() {
        if (this.value !== contraseña.value) {
            this.style.borderColor = '#f44336';
        } else {
            this.style.borderColor = '#4CAF50';
        }
    });
});