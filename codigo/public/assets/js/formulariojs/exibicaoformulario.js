document.addEventListener('DOMContentLoaded', () => {
    loadEvents();
});

async function loadEvents() {
    try {
        const response = await fetch('http://localhost:3000/usuarios');
        const eventos = await response.json();
        
        const container = document.getElementById('cardQuiz');
        container.innerHTML = `
            <div id="form-container">
            <div class="card" id="question-1">
                <h2>Qual é a capital do Brasil?</h2>
                <button onclick="nextQuestion(1)">Brasília</button>
                <button onclick="nextQuestion(1)">Rio de Janeiro</button>
                <button onclick="nextQuestion(1)">São Paulo</button>
            </div>
            <div class="card hidden" id="question-2">
                <h2>Qual é a moeda do Brasil?</h2>
                <button onclick="nextQuestion(2)">Dólar</button>
                <button onclick="nextQuestion(2)">Real</button>
                <button onclick="nextQuestion(2)">Euro</button>
            </div>
            <div class="card hidden" id="question-3">
                <h2>Qual é a maior floresta tropical do mundo?</h2>
                <button onclick="nextQuestion(3)">Floresta Amazônica</button>
                <button onclick="nextQuestion(3)">Floresta Negra</button>
                <button onclick="nextQuestion(3)">Taiga</button>
            </div>
            <div class="card hidden" id="finish-card">
                <h2>Parabéns! Você concluiu o questionário! 🎉</h2>
            </div>
        </div>
        `;

        eventos.forEach(evento => {
            const card = createEventCard(evento);
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Erro ao carregar eventos:', error);
    }
}

function createEventCard(evento) {
    const article = document.createElement('article');
    article.className = 'articlehover postcard orangebgcard red';
    article.onclick = () => navigateToEventDetails(evento.id);

    article.innerHTML = `
        <a class="postcard__img_link" href="#">
            <img class="postcard__img" src="${evento.imagem}" alt="${evento.titulo}" />    
        </a>
        <div class="postcard__text">
            <h1 class="postcard__title"><a href="#">${evento.titulo}</a></h1>
            <div class="postcard__subtitle small">
                <time datetime="${evento.data}">
                    <i class="fas fa-calendar-alt mr-2"></i><span class="me-2"></span>${new Date(evento.data).toLocaleDateString('pt-BR')}
                </time>
            </div>
            <div class="postcard__bar"></div>
            <div class="postcard__preview-txt">${evento.descricao}</div>
            <ul class="postcard__tagbox">
                <li class="tag__item"><i class="fas fa-tag mr-2"></i><span class="me-2"></span>${evento.categoria}</li>
                <li class="tag__item"><i class="fas fa-map-marker-alt mr-2"></i><span class="me-2"></span>${evento.local}</li>
                <li class="tag__item play red">
                    <a href="#"><i class="fas fa-info-circle mr-2 text-white"></i><span class="me-2"></span>Ver Detalhes</a>
                </li>
            </ul>
        </div>
    `;

    return article;
}

function navigateToEventDetails(eventoId) {
    window.location.href = `detalhesevento.html?id=${eventoId}`;
}