document.addEventListener('DOMContentLoaded', () => {
    loadEvents();
});

async function loadEvents() {
    try {
        const response = await fetch('http://localhost:3000/eventos');
        const eventos = await response.json();
        const container = document.getElementById('cardseventos');
        container.innerHTML = '';

        eventos.forEach(evento => {
            const card = createEventCard(evento);
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Erro ao carregar eventos:', error);
        container.innerHTML = '<p>Erro ao carregar eventos.</p>';
    }
}

function createEventCard(evento) {
    const card = document.createElement('div');
    card.className = 'event-card';
    card.innerHTML = `
        <img src="${evento.imagem}" alt="${evento.titulo}" class="event-img">
        <h3>${evento.titulo}</h3>
        <p>${evento.descricao}</p>
        <span>${new Date(evento.data).toLocaleDateString('pt-BR')}</span>
        <a href="detalhesevento.html?id=${evento.id}" class="details-link">Ver Detalhes</a>
    `;
    return card;
}
