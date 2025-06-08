document.addEventListener('DOMContentLoaded', () => {
    loadEvents();
});

async function loadEvents() {
    try {

        const response = await fetch('http://localhost:3000/eventos');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const eventos = await response.json();
        
        if (!eventos || eventos.length === 0) {
            throw new Error('Nenhum evento encontrado');
        }

        console.log('Eventos carregados:', eventos); 

        const container = document.getElementById('cardseventos');
        if (!container) {
            throw new Error('Container não encontrado');
        }


        container.innerHTML = `
            <section class="event-header py-5 text-center text-white margemtopo">
                <div class="container">
                    <h1 class="display-3 fw-bold mb-3" id="pageHeaderTitle">PRÓXIMOS EVENTOS</h1>
                    <div class="separator mx-auto mb-4"></div>
                    <p class="lead">Fique por dentro dos eventos que estão por vir!</p>
                </div>
            </section>
            <div class="events-container"></div>
        `;

        const eventsContainer = container.querySelector('.events-container');
        

        const validEvents = eventos.filter(evento => evento.id);
        

        validEvents.sort((a, b) => new Date(a.data) - new Date(b.data));

        validEvents.forEach(evento => {
            const card = createEventCard(evento);
            eventsContainer.appendChild(card);
        });

    } catch (error) {
        console.error('Erro ao carregar eventos:', error);
        const container = document.getElementById('cardseventos');
        container.innerHTML = `
            <div class="alert alert-warning m-4">
                <h1 class="text-center bg-warning rounded">MENSAGEM PARA QUEM ESTÁ ME AVALIANDO:</h1>
                <h3>AO ABRIR O SITE E APARECER ESTA MENSAGEM, UTILIZE NO TERMINAL DE SEU VS CODE OS COMANDOS NA SEGUINTE ORDEM PARA FAZER O JSON-SERVER FUNCIONAR E, CONSEQUENTEMENTE, O SITE:</h3>
                <ul>
                    <li>npm install -g json-server</li>
                    <li>cd local-que-o-arquivo-esta (EXEMPLO: cd c:\\Users\\felip\\OneDrive\\Desktop\\projetospessoais\\plf-es-2025-1-ti1-0385100-tdr-consultoria\\codigo) - Se precisar coloque esse comando no seu copilot que ele te fornece a localidade</li>
                    <li>json-server --watch db/db.json --port 3000</li>
                </ul>
                <small>Após esses passos o site funcionará corretamente</small>
                <hr>
                <p class="text-danger mb-0">Erro específico: ${error.message}</p>
            </div>
        `;
    }
}

function createEventCard(evento) {
    const article = document.createElement('article');
    article.className = 'articlehover postcard orangebgcard red';

    const detailsPath = 'detalheseventos.html';
    
    // Fix image path by adding '../../../' to go up to the public folder
    const imagePath = `../../../${evento.imagem}`;

    article.innerHTML = `
        <a class="postcard__img_link" href="${detailsPath}?id=${evento.id}">
            <img class="postcard__img" src="${imagePath}" alt="${evento.titulo}" />    
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
                <li class="tag__item play green" onclick="window.location.href='${detailsPath}?id=${evento.id}'">
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
                <li class="tag__item play red" onclick="window.location.href='${detailsPath}?id=${evento.id}'">
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