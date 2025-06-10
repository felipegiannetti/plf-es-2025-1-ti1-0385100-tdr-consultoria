document.addEventListener('DOMContentLoaded', function() {
    const eventsTable = document.getElementById('eventsTable');
    const cardseventos = document.getElementById('cardseventos');
    const searchInput = document.getElementById('searchEvents');
    let allEvents = []; // Store all events

    async function loadEvents() {
        try {
            const response = await fetch('http://localhost:3000/eventos');
            allEvents = await response.json();
            
            // Filtra apenas eventos ativos
            allEvents = allEvents.filter(event => event.status === "ativo");
            
            renderEvents(allEvents);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    function renderEvents(events) {
        // Renderize eventosAtivos na tabela/lista
        eventsTable.innerHTML = events.map(event => `
            <tr>
                <td>${event.titulo}</td>
                <td>${new Date(event.data).toLocaleDateString('pt-BR')}</td>
                <td>${event.categoria}</td>
                <td>${event.vagas}</td>
                <td>R$ ${event.preco.toFixed(2)}</td>
            </tr>
        `).join('');

        // Limpa o container de cards
        cardseventos.innerHTML = '';

        // Adiciona um card para cada evento ativo
        events.forEach(evento => {
            const card = createEventCard(evento);
            cardseventos.appendChild(card);
        });
    }

    function createEventCard(evento) {
        const article = document.createElement('article');
        article.className = 'articlehover postcard orangebgcard red';

        const detailsPath = 'detalheseventos.html';
        const imagePath = `../../../${evento.imagem}`;
        const usuarioId = 1; // ID estático para testes

        article.innerHTML = `
            <a class="postcard__img_link" href="${detailsPath}?id=${evento.id}&idUsuario=${usuarioId}">
                <img class="postcard__img" src="${imagePath}" alt="${evento.titulo}" />    
            </a>
            <div class="postcard__text">
                <h1 class="postcard__title">
                    <a href="${detailsPath}?id=${evento.id}&idUsuario=${usuarioId}">${evento.titulo}</a>
                </h1>
                <div class="postcard__subtitle small">
                    <time datetime="${evento.data}">
                        <i class="fas fa-calendar-alt mr-2"></i>
                        <span class="me-2"></span>${new Date(evento.data).toLocaleDateString('pt-BR')}
                        <i class="fas fa-clock ms-3 me-2"></i>${new Date(evento.data).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}
                    </time>
                </div>
                <div class="postcard__bar"></div>
                <div class="postcard__preview-txt">${evento.descricao}</div>
                <ul class="postcard__tagbox">
                    <li class="tag__item play green" onclick="window.location.href='${detailsPath}?id=${evento.id}&idUsuario=${usuarioId}'">
                        <button class="tag-button">
                            <i class="fas fa-user-plus mr-2"></i>
                            <span class="me-2"></span>Inscrever-se
                        </button>
                    </li>
                    <li class="tag__item">
                        <button class="tag-button">
                            <i class="fas fa-tag mr-2"></i>
                            <span class="me-2"></span>${evento.categoria}
                        </button>
                    </li>
                    <li class="tag__item" onclick="window.open('${evento.localmapa}', '_blank')">
                        <button class="tag-button">
                            <i class="fas fa-map-marker-alt mr-2"></i>
                            <span class="me-2"></span>${evento.local}
                        </button>
                    </li>
                    <li class="tag__item play red" onclick="window.location.href='${detailsPath}?id=${evento.id}&idUsuario=${usuarioId}'">
                        <button class="tag-button">
                            <i class="fas fa-info-circle mr-2 text-white"></i>
                            <span class="me-2"></span>Ver Detalhes
                        </button>
                    </li>
                </ul>
            </div>
        `;

        return article;
    }

    // Add search functionality
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const filteredEvents = allEvents.filter(event => 
            event.titulo.toLowerCase().includes(searchTerm)
        );
        renderEvents(filteredEvents);
    });

    loadEvents(); // Initial load
});