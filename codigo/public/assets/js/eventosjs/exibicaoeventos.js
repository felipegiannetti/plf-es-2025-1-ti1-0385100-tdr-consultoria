document.addEventListener('DOMContentLoaded', () => {
    loadEvents();
});

async function loadEvents() {
    try {
        const response = await fetch('http://localhost:3000/eventos');
        const eventos = await response.json();
        
        const container = document.getElementById('cardseventos');
        container.innerHTML = `
        <section class="event-header py-5 text-center text-white">
            <div class="container">
                <h1 class="display-3 fw-bold mb-3" id="pageHeaderTitle">PRÓXIMOS EVENTOS</h1>
                <div class="separator mx-auto mb-4"></div>
                <p class="lead">Fique por dentro dos eventos que estão por vir!</p>
            </div>
            </section>
        `;

        eventos.forEach(evento => {
            const card = createEventCard(evento);
            container.appendChild(card);
        });

        const featuresSection = document.getElementById('featuresSection');
        eventos.forEach(evento => {
            featuresSection.innerHTML += `
                <div class="feature">
                    <img src="${evento.imagem}" alt="${evento.titulo}">
                    <h2>${evento.titulo}</h2>
                    <p>${evento.descricao}</p>
                    <p>Data: ${new Date(evento.data).toLocaleDateString()}</p>
                    <p>Preço: R$ ${evento.preco.toFixed(2)}</p>
                    <p>Vagas: ${evento.vagas}</p>
                    <div class="button-group">
                        <button class="btn btn-primary" onclick="window.location.href='detalheseventos.html?id=${evento.id}'">Ver Detalhes</button>
                        <button class="btn btn-success">Inscrever-se</button>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error('Erro ao carregar eventos:', error);
    }
}

function createEventCard(evento) {
    const article = document.createElement('article');
    article.className = 'articlehover postcard orangebgcard red';

    article.innerHTML = `
        <a class="postcard__img_link" href="detalheseventos.html?id=${evento.id}">
            <img class="postcard__img" src="${evento.imagem}" alt="${evento.titulo}" />    
        </a>
        <div class="postcard__text">
            <h1 class="postcard__title"><a href="detalheseventos.html?id=${evento.id}">${evento.titulo}</a></h1>
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
                    <a href="detalheseventos.html?id=${evento.id}"><i class="fas fa-info-circle mr-2 text-white"></i><span class="me-2"></span>Ver Detalhes</a>
                </li>
            </ul>
        </div>
    `;

    return article;
}