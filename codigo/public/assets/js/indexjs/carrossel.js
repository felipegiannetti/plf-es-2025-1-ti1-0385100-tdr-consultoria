// Elementos do carrossel
const carouselInner = document.querySelector('#eventCarousel .carousel-inner');
const indicatorsContainer = document.querySelector('#eventCarousel .carousel-indicators');

// Busca eventos do JSON Server
async function fetchEvents() {
  try {
    const res = await fetch('http://localhost:3000/eventos');
    if (!res.ok) throw new Error('Erro ao buscar eventos');
    const data = await res.json();
    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Escolhe 4 eventos aleatórios únicos
function getRandomEvents(arr, num = 4) {
  const copy = [...arr];
  const selected = [];
  while (selected.length < num && copy.length > 0) {
    const idx = Math.floor(Math.random() * copy.length);
    selected.push(copy.splice(idx, 1)[0]);
  }
  return selected;
}

// Formata a data para exibição
function formatDate(dateString) {
  const options = { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric',
    hour: '2-digit', 
    minute: '2-digit' 
  };
  return new Date(dateString).toLocaleDateString('pt-BR', options);
}

// Cria o carrossel no DOM
function buildCarousel(events) {
  carouselInner.innerHTML = '';
  indicatorsContainer.innerHTML = '';

  events.forEach((evento, idx) => {
    // Cria o item do carrossel
    const divItem = document.createElement('div');
    divItem.className = `carousel-item ${idx === 0 ? 'active' : ''}`;
    
    // Cria a imagem
    const img = document.createElement('img');
    img.src = evento.imagem;
    img.alt = evento.titulo;
    img.className = 'd-block w-100';
    img.loading = 'lazy';
    
    // Cria o caption
    const caption = document.createElement('div');
    caption.className = 'carousel-caption d-none d-md-block';
    caption.innerHTML = `
      <h3>${evento.titulo}</h3>
      <p>${evento.descricao}</p>
      <small><i class="fas fa-calendar-alt me-2"></i>${formatDate(evento.data)} | <i class="fas fa-map-marker-alt me-2"></i>${evento.local}</small>
    `;
    
    divItem.appendChild(img);
    divItem.appendChild(caption);
    carouselInner.appendChild(divItem);
    
    // Cria os indicadores
    const indicator = document.createElement('button');
    indicator.type = 'button';
    indicator.dataset.bsTarget = '#eventCarousel';
    indicator.dataset.bsSlideTo = idx;
    if (idx === 0) indicator.className = 'active';
    indicator.setAttribute('aria-current', idx === 0 ? 'true' : 'false');
    indicator.setAttribute('aria-label', `Slide ${idx + 1}`);
    
    indicatorsContainer.appendChild(indicator);
  });
  
  // Inicializa o carrossel do Bootstrap
  const carousel = new bootstrap.Carousel('#eventCarousel', {
    interval: 5000,
    ride: 'carousel',
    wrap: true
  });
}

// Inicia o carrossel
async function initCarousel() {
  const allEvents = await fetchEvents();

  if (allEvents.length === 0) {
    carouselInner.innerHTML = '<div class="carousel-item active"><div class="d-flex align-items-center justify-content-center bg-dark text-white p-5" style="height: 500px;"><p class="text-center">Não há eventos disponíveis no momento.</p></div></div>';
    return;
  }

  const events = getRandomEvents(allEvents, 4);
  buildCarousel(events);
}

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', async function() {
    const carouselInner = document.querySelector('#eventCarousel .carousel-inner');
    const carouselIndicators = document.querySelector('.carousel-indicators');

    try {
        // Fetch events from API
        const response = await fetch('http://localhost:3000/eventos');
        let events = await response.json();

        // Filter active events and sort by closest date
        const today = new Date();
        events = events
            .filter(event => event.status === 'ativo' && new Date(event.data) >= today)
            .sort((a, b) => new Date(a.data) - new Date(b.data))
            .slice(0, 3);

        // Create carousel items
        carouselInner.innerHTML = events.map((event, index) => `
        <div class="carousel-item ${index === 0 ? 'active' : ''}">
          <img src="http://localhost:4000/${event.imagem}" class="d-block w-100" alt="${event.titulo}">
          <div class="carousel-caption d-none d-md-block">
            <h5>${event.titulo}</h5>
            <p>Data: ${new Date(event.data).toLocaleDateString('pt-BR')}</p>
            <p>Local: ${event.local}</p>
            <a href="public/modulos/eventos/exibicaoeventos.html" class="btn btn-primary">Saiba mais</a>
          </div>
        </div>
        `).join('');

        // Create carousel indicators
        carouselIndicators.innerHTML = events.map((_, index) => `
            <button type="button" 
                    data-bs-target="#eventCarousel" 
                    data-bs-slide-to="${index}" 
                    ${index === 0 ? 'class="active" aria-current="true"' : ''} 
                    aria-label="Slide ${index + 1}">
            </button>
        `).join('');

        // If no events found
        if (events.length === 0) {
            carouselInner.innerHTML = `
                <div class="carousel-item active">
                    <div class="no-events-message">
                        <h3>Não há eventos próximos</h3>
                        <p>Fique atento para novos eventos em breve!</p>
                    </div>
                </div>`;
        }

    } catch (error) {
        console.error('Erro ao carregar eventos:', error);
        carouselInner.innerHTML = `
            <div class="carousel-item active">
                <div class="error-message">
                    <h3>Erro ao carregar eventos</h3>
                    <p>Por favor, tente novamente mais tarde.</p>
                </div>
            </div>`;
    }
});