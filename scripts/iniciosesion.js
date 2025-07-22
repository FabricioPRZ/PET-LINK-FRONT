document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const correoInput = document.getElementById('correo');
  const contraseñaInput = document.getElementById('contraseña');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const correo = correoInput.value.trim();
    const contraseña = contraseñaInput.value.trim();

    let camposValidos = true;

    if (correo === '') {
      correoInput.style.border = '2px solid red';
      camposValidos = false;
    }

    if (contraseña === '') {
      contraseñaInput.style.border = '2px solid red';
      camposValidos = false;
    }

    if (!camposValidos) {
      alert('⚠️ Por favor, completa todos los campos.');
      return;
    }

    const resultado = await verificarCredenciales(correo, contraseña);

    if (!resultado.autenticado) {
      correoInput.style.border = '2px solid red';
      contraseñaInput.style.border = '2px solid red';
      alert('Usuario o contraseña incorrectos. Verifica tus datos.');
      return;
    }

    alert('¡Inicio de sesión exitoso!');

    // Guardar el tipo de usuario en localStorage
    localStorage.setItem('tipo_usuario', resultado.tipo_usuario);

    // Redirigir según el tipo de usuario
    if (resultado.tipo_usuario === 'admin') {
      window.location.href = '/administrador pages/adoptar_admin.html';
    } else {
      window.location.href = '/pages/adoptar.html';
    }
  });

  correoInput.addEventListener('input', () => correoInput.style.border = '');
  contraseñaInput.addEventListener('input', () => contraseñaInput.style.border = '');
});

async function verificarCredenciales(correo, contraseña) {
  try {
    const response = await fetch('http://44.208.231.53:7078/usuarios/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ correo, contraseña })
    });

    if (!response.ok) {
      return { autenticado: false };
    }

    const data = await response.json();

    // Guardar toda la información relevante
    localStorage.setItem('jwt', data.token);
    localStorage.setItem('token', data.token); // Por compatibilidad con código existente
    localStorage.setItem('userId', data.usuario.id);
    localStorage.setItem('userData', JSON.stringify(data.usuario));
    localStorage.setItem('tipo_usuario', data.usuario.tipo_usuario);

    return {
      autenticado: true,
      tipo_usuario: data.usuario.tipo_usuario
    };
  } catch (error) {
    console.error('Error de conexión:', error);
    return { autenticado: false };
  }
}
