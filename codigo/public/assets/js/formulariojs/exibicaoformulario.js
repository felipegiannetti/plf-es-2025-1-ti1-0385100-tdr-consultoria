document.addEventListener('DOMContentLoaded', () => {
    loadEvents();
});

//Sistema que carrega o card do formulario na pagina exibiformulario.html
async function loadEvents() {
    try {
        const response = await fetch('http://localhost:3000/usuarios');
        const usuarios = await response.json();
        
        const container = document.getElementById('cardQuiz');
        container.innerHTML = `
           <div class="card" id="card">
                <h2 id="title">Descubra seu nicho</h2>
                <p id="question">Com qual dessas areas você mais se identifica?</p>
                <div class="options" id="options">
                    <input type="radio" name="option" id="opt1" value="Financias"><label for="opt1">Financias</label>
                    <input type="radio" name="option" id="opt2" value="Bolsa de valores"><label for="opt2">Bolsa de valores</label>
                    <input type="radio" name="option" id="opt3" value="RH"><label for="opt3">RH</label>
                    <input type="radio" name="option" id="opt4" value="Construtora"><label for="opt4">Construtora</label>
                </div>
            </div>
        `;

    const optionsDiv = document.getElementById("options");
    if (optionsDiv) {
        optionsDiv.addEventListener("click", nextQuestion);
    }

    } catch (error) {
        console.error('Erro ao carregar usuarios:', error);
    }
}