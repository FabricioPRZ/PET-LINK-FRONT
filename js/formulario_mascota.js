let formTouched = false;

// Mapeos para IDs de tu base de datos
const especieMap = {
    "Perro": 1,
    "Gato": 2,
    "Hamster": 3,
    "Tortuga": 4,
    "Pájaro": 5,
    "Conejo": 6,
    "Reptil": 7
};
const tamanoMap = {
    "Pequeño": 1,
    "Mediano": 2,
    "Grande": 3
};
const vacunasMap = {
    "Moquillo": 1,
    "Parvovirus": 2,
    "Hepatitis": 3,
    "Rabia": 4,
    "Triple felina": 5,
    "Panleucopenia": 6,
    "Virus de inmunodeficiencia felina (FIV)": 7,
    "Enfermedad vírica hemorrágica": 8
};

// Limita los campos de texto a 255 caracteres
["nombre", "condiciones", "enfermedades", "descripcion-mascota", "raza"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.setAttribute("maxlength", "255");
});

const inputs = [
    'nombre', 'especie', 'tamano', 'peso', 'sexo',
    'condiciones', 'raza', 'esterilizada', 'desparacitada',
    'enfermedades', 'descripcion-mascota'
    // imagenes eliminadas de la validación obligatoria
];

function validarCampo(id) {
    const el = document.getElementById(id);
    if (!el) return false;
    if (el.type === 'file') return true; // Siempre válido, ya no es obligatorio
    if (el.tagName === 'SELECT') return el.value !== "";
    return el.value.trim().length > 0;
}

function validarPeso() {
    const peso = document.getElementById('peso');
    const val = peso.value.trim();
    return val !== "" && !isNaN(parseFloat(val)) && parseFloat(val) >= 0;
}

function validarForm() {
    let valido = true;
    for (const id of inputs) {
        if (id === 'peso') {
            if (!validarPeso()) valido = false;
            continue;
        }
        if (!validarCampo(id)) valido = false;
    }
    document.getElementById('enviarForm').disabled = !valido;
    mostrarErrores(valido);
    return valido;
}

function mostrarErrores(valido) {
    let errorDiv = document.getElementById('errores-form');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'errores-form';
        errorDiv.style.color = 'red';
        errorDiv.style.fontSize = '18px';
        errorDiv.style.marginTop = '10px';
        document.querySelector('.registrar-boton').appendChild(errorDiv);
    }
    // Solo mostrar error si el formulario está inválido Y el usuario ha interactuado
    if (!valido && formTouched) {
        errorDiv.textContent = 'Por favor, completa todos los campos obligatorios.';
    } else {
        errorDiv.textContent = '';
    }
}

// Listener en todos los campos
inputs.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.type === 'file') {
        el.addEventListener('change', () => {
            formTouched = true;
            validarForm();
        });
    } else {
        el.addEventListener('input', () => {
            formTouched = true;
            validarForm();
        });
        el.addEventListener('change', () => {
            formTouched = true;
            validarForm();
        });
    }
});
document.querySelectorAll('#vacunas-dropdown input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => {
        formTouched = true;
        validarForm();
    });
});
validarForm(); // Inicializa el estado del botón

// Envío del formulario
document.getElementById('enviarForm').addEventListener('click', function() {
    formTouched = true;
    if (!validarForm()) return;

    const nombre = document.getElementById('nombre').value.trim();
    const codigo_especie = especieMap[document.getElementById('especie').value] ?? null;
    const codigo_tamano = tamanoMap[document.getElementById('tamano').value] ?? null;
    const peso = parseFloat(document.getElementById('peso').value.trim());
    const sexo = document.getElementById('sexo').value;
    const raza = document.getElementById('raza').value.trim();
    const condiciones = document.getElementById('condiciones').value.trim();
    const esterilizado = document.getElementById('esterilizada').value;
    const desparasitado = document.getElementById('desparacitada').value;
    const discapacitado = condiciones; // Mapea a condiciones especiales
    const enfermedades = document.getElementById('enfermedades').value.trim();
    const descripcion = document.getElementById('descripcion-mascota').value.trim();

    // Vacunas
    const vacunasSeleccionadas = [];
    document.querySelectorAll('#vacunas-dropdown input[type="checkbox"]:checked').forEach(cb => {
        const num = vacunasMap[cb.value];
        if (num) vacunasSeleccionadas.push(num);
    });

    // Imágenes (solo nombres de archivo, opcional)
    const fotos = [];
    for (let i = 1; i <= 3; i++) {
        const fileInput = document.getElementById('file' + i);
        if (fileInput && fileInput.files[0]) {
            fotos.push(fileInput.files[0].name);
        }
    }

    // id_solicitudCedente: deberás obtenerlo de tu sistema/autenticación
    const id_solicitudCedente = 1; // <-- Cambia esto por el valor real

    // Objeto para la API (ajusta las claves según tu modelo)
    const datosMascota = {
        nombre_mascotas: nombre,
        codigo_especie,
        sexo,
        peso,
        codigo_tamaño,
        raza,
        esterilizado,
        desparasitado,
        discapacitado,
        enfermedades,
        descripcion,
        id_solicitudCedente,
        fotos,
        vacunas: vacunasSeleccionadas
    };

    fetch('http://localhost:8080/mascotas', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosMascota)
    })
    .then(response => response.json())
    .then(data => {
        alert('Mascota registrada correctamente');
    })
    .catch(error => {
        alert('Error al registrar la mascota');
        console.error(error);
    });
});
