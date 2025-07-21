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
    window.location.href = '/index.html';
  });

  correoInput.addEventListener('input', () => correoInput.style.border = '');
  contraseñaInput.addEventListener('input', () => contraseñaInput.style.border = '');
});

async function verificarCredenciales(correo, contraseña) {
  try {
    const response = await fetch('http://localhost:7070/usuarios/login', {
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
    localStorage.setItem('jwt', data.token); // guarda JWT para futuras peticiones
    return { autenticado: true };
  } catch (error) {
    console.error('Error de conexión:', error);
    return { autenticado: false };
  }
}
