document.addEventListener('DOMContentLoaded', () => {
    loadEvents();
});

async function loadEvents() {
    try {
        const response = await fetch('http://localhost:3000/usuarios');
        const usuarios = await response.json();
        
        const container = document.getElementById('cardQuiz');
        container.innerHTML = `
           <div class="card" id="card">
        <img src="https://img.icons8.com/fluency-systems-regular/48/ffffff/document.png" alt="Document Icon">
        <h2 id="title">Sua opinião importa</h2>
        <p id="question">Como você avalia nosso produto?</p>
        <div class="options" id="options">
            <label><input type="radio" name="option" value="Excelente"> Excelente</label>
            <label><input type="radio" name="option" value="Bom"> Bom</label>
            <label><input type="radio" name="option" value="Razoável"> Razoável</label>
            <label><input type="radio" name="option" value="Ruim"> Ruim</label>
            <label><input type="radio" name="option" value="Péssimo"> Péssimo</label>
        </div>
        <button class="submit-btn" onclick="nextQuestion()">PRÓXIMA</button>
    </div>
        `;

    } catch (error) {
        console.error('Erro ao carregar usuarios:', error);
    }
}