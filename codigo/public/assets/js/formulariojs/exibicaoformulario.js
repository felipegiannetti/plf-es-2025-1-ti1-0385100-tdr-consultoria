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
            <h2 id="title">Sua opinião importa</h2>
            <p id="question">Como você avalia nosso produto?</p>
            <div class="options" id="options">
                <input type="radio" name="option" id="opt1" value="Excelente"><label for="opt1">Excelente</label>
                <input type="radio" name="option" id="opt2" value="Bom"><label for="opt2">Bom</label>
                <input type="radio" name="option" id="opt3" value="Razoável"><label for="opt3">Razoável</label>
                <input type="radio" name="option" id="opt4" value="Ruim"><label for="opt4">Ruim</label>
                <input type="radio" name="option" id="opt5" value="Péssimo"><label for="opt5">Péssimo</label>
            </div>
        </div>
        `;

    } catch (error) {
        console.error('Erro ao carregar usuarios:', error);
    }
}