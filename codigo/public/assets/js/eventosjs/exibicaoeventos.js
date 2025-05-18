document.addEventListener('DOMContentLoaded', () => {
    loadEvents();
});

async function loadEvents() {
    try {
        // Add error handling for the fetch request
        const response = await fetch('http://localhost:3000/eventos');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const eventos = await response.json();
        
        if (!eventos || eventos.length === 0) {
            throw new Error('Nenhum evento encontrado');
        }

        console.log('Eventos carregados:', eventos); // Debug log

        const container = document.getElementById('cardseventos');
        if (!container) {
            throw new Error('Container não encontrado');
        }

        // Clear existing content
        container.innerHTML = `
            <section class="event-header py-5 text-center text-white">
                <div class="container">
                    <h1 class="display-3 fw-bold mb-3" id="pageHeaderTitle">PRÓXIMOS EVENTOS</h1>
                    <div class="separator mx-auto mb-4"></div>
                    <p class="lead">Fique por dentro dos eventos que estão por vir!</p>
                </div>
            </section>
            <div class="events-container"></div>
        `;

        const eventsContainer = container.querySelector('.events-container');
        
        // Filter out events without IDs
        const validEvents = eventos.filter(evento => evento.id);
        
        // Sort events by date
        validEvents.sort((a, b) => new Date(a.data) - new Date(b.data));

        validEvents.forEach(evento => {
            const card = createEventCard(evento);
            eventsContainer.appendChild(card);
        });

    } catch (error) {
        console.error('Erro ao carregar eventos:', error);
        const container = document.getElementById('cardseventos');
        container.innerHTML = `
            <div class="alert alert-danger m-3">
                <h4 class="alert-heading">Erro ao carregar eventos</h4>
                <p>${error.message}</p>
                <hr>
                <p class="mb-0">Por favor, verifique se o servidor JSON está rodando corretamente.</p>
                <code>json-server --watch db/db.json --port 3000</code>
            </div>
        `;
    }
}

function createEventCard(evento) {
    const article = document.createElement('article');
    article.className = 'articlehover postcard orangebgcard red';

    // Use relative path instead of absolute path
    const detailsPath = 'detalheseventos.html';

    article.innerHTML = `
        <a class="postcard__img_link" href="${detailsPath}?id=${evento.id}">
            <img class="postcard__img" src="${evento.imagem}" alt="${evento.titulo}" />    
        </a>
        <div class="postcard__text">
            <h1 class="postcard__title">
                <a href="${detailsPath}?id=${evento.id}">${evento.titulo}</a>
            </h1>
            <div class="postcard__subtitle small">
                <time datetime="${evento.data}">
                    <i class="fas fa-calendar-alt mr-2"></i>
                    <span class="me-2"></span>${new Date(evento.data).toLocaleDateString('pt-BR')}
                </time>
            </div>
            <div class="postcard__bar"></div>
            <div class="postcard__preview-txt">${evento.descricao}</div>
            <ul class="postcard__tagbox">
                <li class="tag__item">
                    <i class="fas fa-tag mr-2"></i>
                    <span class="me-2"></span>${evento.categoria}
                </li>
                <li class="tag__item">
                    <i class="fas fa-map-marker-alt mr-2"></i>
                    <span class="me-2"></span>${evento.local}
                </li>
                <li class="tag__item play red">
                    <a href="${detailsPath}?id=${evento.id}">
                        <i class="fas fa-info-circle mr-2 text-white"></i>
                        <span class="me-2"></span>Ver Detalhes
                    </a>
                </li>
            </ul>
        </div>
    `;

    return article;
}