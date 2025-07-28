document.getElementById('registroForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const contraseña = document.getElementById('contraseña').value;
    const confirmacion = document.getElementById('confirmar_contraseña').value;
    
    if (contraseña !== confirmacion) {
        alert('¡Las contraseñas no coinciden!');
        return;
    }

    const formData = new FormData();

    formData.append('tipo_usuario', 'cedente');
    formData.append('nombres', document.getElementById('nombres').value);
    formData.append('apellido_paterno', document.getElementById('apellido_paterno').value);
    formData.append('apellido_materno', document.getElementById('apellido_materno').value);
    formData.append('edad', document.getElementById('edad').value);
    formData.append('correo', document.getElementById('correo').value);
    formData.append('contraseña', contraseña);
    
    const archivoINE = document.getElementById('foto_ine').files[0];
    if (archivoINE) {
        formData.append('ine', archivoINE);
    }

    console.log("Datos a enviar:");
    for (let [clave, valor] of formData.entries()) {
        console.log(clave, valor);
    }

    try {
        const respuesta = await fetch('http://44.208.231.53:7078/usuarios', {
            method: 'POST',
            body: formData
        });

        if (!respuesta.ok) {
            const error = await respuesta.json();
            console.error("Error detallado:", error);
            throw new Error(error.error || `Error ${respuesta.status}`);
        }

        const datos = await respuesta.json();
        alert('Registro exitoso!');
            window.location.href = '/src/app/Admin/pages/login/iniciosesion.html';        
    } catch (error) {
        console.error("Error completo:", error);
        alert(`Error: ${error.message}`);
    }
});