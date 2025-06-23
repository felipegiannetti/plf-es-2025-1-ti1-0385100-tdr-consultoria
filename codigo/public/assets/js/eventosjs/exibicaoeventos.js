document.addEventListener('DOMContentLoaded', function () {
    const eventsTable = document.getElementById('eventsTable');
    const cardseventos = document.getElementById('cardseventos');
    const searchInput = document.getElementById('searchEvents');
    let allEvents = [];

    const EVENTS_PER_PAGE = 8;
    let currentPage = 1;
    let totalPages = 0;

    async function loadEvents() {
        try {
            const response = await fetch('http://localhost:3000/eventos');
            allEvents = await response.json();

            // Filtra apenas eventos ativos
            allEvents = allEvents.filter(event => event.status === "ativo");

            renderEvents(allEvents);
        } catch (error) {
            console.error('Erro ao carregar eventos:', error);
        }
    }

    function renderEvents(events) {
        totalPages = Math.ceil(events.length / EVENTS_PER_PAGE);
        const startIndex = (currentPage - 1) * EVENTS_PER_PAGE;
        const endIndex = startIndex + EVENTS_PER_PAGE;
        const currentEvents = events.slice(startIndex, endIndex);

        // Renderiza na tabela (invisível)
        eventsTable.innerHTML = currentEvents.map(event => `
            <tr>
                <td>${event.titulo}</td>
                <td>${new Date(event.data).toLocaleDateString('pt-BR')}</td>
                <td>${event.categoria}</td>
                <td>${event.vagas}</td>
                <td>R$ ${event.preco.toFixed(2)}</td>
            </tr>
        `).join('');

        // Limpa os cards e adiciona os novos
        cardseventos.innerHTML = '';
        currentEvents.forEach(evento => {
            const card = createEventCard(evento);
            cardseventos.appendChild(card);
        });

        // Remove a paginação existente, se presente
        const existingPagination = document.querySelector('.pagination-container');
        if (existingPagination) {
            existingPagination.remove();
        }

        // Adiciona nova paginação
        renderPagination(events.length);

        if (events.length === 0) {
            cardseventos.innerHTML = `
                <div class="alert alert-warning text-center w-100">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Nenhum evento encontrado com os critérios de busca.
                </div>
            `;
        }
    }

    function renderPagination(totalEvents) {
        const paginationContainer = document.createElement('div');
        paginationContainer.className = 'pagination-container mt-4';

        // Renderiza a paginação apenas se houver mais de uma página
        if (totalPages > 1) {
            const pagination = document.createElement('ul');
            pagination.className = 'pagination justify-content-center';

            // Botão Previous
            pagination.innerHTML = `
                <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                    <a class="page-link" href="#" data-page="${currentPage - 1}" aria-label="Previous">
                        <i class="fas fa-chevron-left"></i>
                    </a>
                </li>
            `;

            // Números das páginas
            for (let i = 1; i <= totalPages; i++) {
                pagination.innerHTML += `
                    <li class="page-item ${currentPage === i ? 'active' : ''}">
                        <a class="page-link" href="#" data-page="${i}">${i}</a>
                    </li>
                `;
            }

            // Botão Next
            pagination.innerHTML += `
                <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                    <a class="page-link" href="#" data-page="${currentPage + 1}" aria-label="Next">
                        <i class="fas fa-chevron-right"></i>
                    </a>
                </li>
            `;

            paginationContainer.appendChild(pagination);
            cardseventos.parentNode.insertBefore(paginationContainer, cardseventos.nextSibling);

            // Adiciona manipuladores de clique
            paginationContainer.addEventListener('click', (e) => {
                e.preventDefault();
                const pageLink = e.target.closest('.page-link');
                if (pageLink) {
                    const newPage = parseInt(pageLink.dataset.page);
                    if (newPage >= 1 && newPage <= totalPages) {
                        currentPage = newPage;
                        renderEvents(allEvents);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                }
            });
        }
    }

    function createEventCard(evento) {
        const article = document.createElement('article');
        article.className = 'articlehover postcard orangebgcard red';

        const detailsPath = 'detalheseventos.html';
        const imagePath = `http://localhost:3000/${evento.imagem}`;  // Agora usa a porta 3000
        const usuarioId = 1; // ID fixo para teste

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
                        <i class="fas fa-clock ms-3 me-2"></i>${new Date(evento.data).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </time>
                </div>
                <div class="postcard__bar"></div>
                <div class="postcard__preview-txt">${evento.descricao}</div>
                <ul class="postcard__tagbox">
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

    // Filtro de busca
    searchInput.addEventListener('input', function (e) {
        const searchTerm = e.target.value.toLowerCase();
        const filteredEvents = allEvents.filter(event =>
            event.titulo.toLowerCase().includes(searchTerm) ||
            event.descricao.toLowerCase().includes(searchTerm) ||
            event.categoria.toLowerCase().includes(searchTerm)
        );
        
        // Reset to first page when searching
        currentPage = 1;
        renderEvents(filteredEvents);

        // Update search results info
        updateSearchInfo(filteredEvents.length, allEvents.length, searchTerm);
    });

    // Add new function to show search results info
    function updateSearchInfo(filteredCount, totalCount, searchTerm) {
        const searchInfo = document.createElement('div');
        searchInfo.className = 'search-info mb-3';
        
        // Remove existing search info if present
        const existingInfo = document.querySelector('.search-info');
        if (existingInfo) {
            existingInfo.remove();
        }

        if (searchTerm) {
            searchInfo.innerHTML = `
                <div class="alert alert-info">
                    <i class="fas fa-search me-2"></i>
                    Encontrado${filteredCount !== 1 ? 's' : ''} ${filteredCount} evento${filteredCount !== 1 ? 's' : ''} 
                    ${filteredCount !== totalCount ? `de ${totalCount} total` : ''}
                </div>
            `;
            searchInput.parentNode.insertBefore(searchInfo, cardseventos);
        }
    }

    loadEvents(); // Carrega eventos ao iniciar
});
