// Opciones de vacunas según especie
const vacunasPorEspecie = {
    Perro: [
        "Moquillo",
        "Parvovirus",
        "Hepatitis",
        "Rabia"
    ],
    Gato: [
        "Triple felina",
        "Panleucopenia",
        "Virus de inmunodeficiencia felina (FIV)",
        "Rabia"
    ],
    Conejo: [
        "Enfermedad vírica hemorrágica"
    ]
    // Más especies si hace falta
};

const especieSelect = document.getElementById('especie');
const vacunasSelect = document.getElementById('vacunas-select');
const vacunasDropdown = document.getElementById('vacunas-dropdown');
const vacunasPlaceholder = document.getElementById('vacunas-placeholder');

let vacunasSeleccionadas = [];

// Mostrar/ocultar el dropdown al hacer click en el select
vacunasSelect.onclick = function(e){
    vacunasSelect.classList.toggle('active');
    vacunasDropdown.style.display = vacunasSelect.classList.contains('active') ? 'flex' : 'none';
};

// SOLO cerrar si el click fue fuera de TODO el menú (ni select ni dropdown)
document.addEventListener('click', function(e){
    if (
        !vacunasSelect.contains(e.target) &&
        !vacunasDropdown.contains(e.target)
    ) {
        vacunasSelect.classList.remove('active');
        vacunasDropdown.style.display = 'none';
    }
});

especieSelect.addEventListener('change', function(){
    const especie = especieSelect.value;
    vacunasDropdown.innerHTML = '';
    vacunasSeleccionadas = [];
    actualizarPlaceholder();

    if(vacunasPorEspecie[especie]){
        vacunasPorEspecie[especie].forEach(vacuna => {
            const option = document.createElement('label');
            option.innerHTML = `
                <input type="checkbox" value="${vacuna}">
                ${vacuna}
            `;
            vacunasDropdown.appendChild(option);

            const checkbox = option.querySelector('input');

            // Evita que el click en el checkbox cierre el menú desplegable
            checkbox.addEventListener('click', function(ev){
                ev.stopPropagation();
            });

            checkbox.addEventListener('change', function(){
                if(this.checked){
                    vacunasSeleccionadas.push(this.value);
                } else {
                    vacunasSeleccionadas = vacunasSeleccionadas.filter(v => v !== this.value);
                }
                actualizarPlaceholder();
            });
        });
        vacunasSelect.style.pointerEvents = 'auto';
        vacunasSelect.style.opacity = 1;
    } else {
        vacunasSelect.style.pointerEvents = 'none';
        vacunasSelect.style.opacity = 0.7;
        vacunasPlaceholder.textContent = "No hay opciones";
    }
});

// Centrar el texto del placeholder cuando no hay vacunas seleccionadas
function actualizarPlaceholder(){
    if(vacunasSeleccionadas.length > 0){
        // Mapear el texto largo de la vacuna al acrónimo FIV si está seleccionado
        // Mantener el orden original en el array
        const displayVacunas = vacunasSeleccionadas.map(nombre => 
            nombre === "Virus de inmunodeficiencia felina (FIV)" ? "FIV" : nombre
        );
        vacunasPlaceholder.textContent = displayVacunas.join(', ');
        vacunasPlaceholder.style.color = "#F08224";
        vacunasPlaceholder.style.textAlign = "left";
    } else {
        vacunasPlaceholder.textContent = "Selecciona una o más";
        vacunasPlaceholder.style.color = "#FEE2C2";
        vacunasPlaceholder.style.textAlign = "center";
    }
}