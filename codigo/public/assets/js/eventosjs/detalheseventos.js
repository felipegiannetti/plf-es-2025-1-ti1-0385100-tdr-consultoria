const API_URL = 'http://localhost:3000';

async function carregarEventos() {
    try {
        const response = await fetch(`${API_URL}/eventos`);
        const eventos = await response.json();

        
        
        const featuresSection = document.querySelector('.features-section .container');
        featuresSection.innerHTML = '';
        
        eventos.forEach(evento => {
            featuresSection.innerHTML += `
                <div class="feature">
                    <img src="${evento.imagem}" alt="${evento.titulo}">
                    <h2>${evento.titulo}</h2>
                    <p>${evento.descricao}</p>
                    <p>Data: ${new Date(evento.data).toLocaleDateString()}</p>
                    <p>Preço: R$ ${evento.preco}</p>
                    <p>Vagas: ${evento.vagas}</p>
                    <button class="cta-button">Inscrever-se</button>
                </div>
            `;
        });
    } catch (error) {
        console.error('Erro ao carregar eventos:', error);
    }
}

async function carregarDetalhesEvento() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const eventoId = urlParams.get('id');

        if (!eventoId) {
            throw new Error('ID do evento não fornecido');
        }

        console.log('Buscando evento com ID:', eventoId); // Debug log

        const response = await fetch(`${API_URL}/eventos/${eventoId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const evento = await response.json();
        
        console.log('Evento carregado:', evento); // Debug log

        const container = document.getElementById('evento-detalhes');

        const cadastroPath = 'cadastrousuariosevento.html';
        
        container.innerHTML = `
            <div class="card mb-4 margemtopodetalhes">
                <div class="row g-0">
                    <div class="col-md-6">
                        <img src="${evento.imagem}" class="img-fluid rounded-start w-100 h-100" alt="${evento.titulo}">
                    </div>
                    <div class="col-md-6">
                        <div class="card-body d-flex flex-column h-100">
                            <div>
                                <h2 class="card-title">${evento.titulo}</h2>
                                <p class="card-text">${evento.descricao}</p>
                                <div class="event-details">
                                    <p><i class="far fa-calendar"></i> Data: ${new Date(evento.data).toLocaleDateString('pt-BR')}</p>
                                    <p><i class="fas fa-map-marker-alt"></i> Local: ${evento.local}</p>
                                    <p><i class="fas fa-ticket-alt"></i> Vagas disponíveis: ${evento.vagas}</p>
                                    <p><i class="fas fa-tag"></i> Categoria: ${evento.categoria}</p>
                                    <p><i class="fas fa-dollar-sign"></i> Preço: R$ ${evento.preco.toFixed(2)}</p>
                                </div>
                            </div>
                            <div class="avaliacoes-section mt-4 mb-4">
                                <h4 class="text-white text-center">Avaliações do evento</h4>
                                <div class="avaliacoes-container" style="max-height: 200px; overflow-y: auto; padding: 10px;">
                                    <div class="avaliacao-item mb-3 p-2 border-bottom">
                                        <div class="stars mb-1">
                                            ★★★★★
                                            <span class="text-muted">(5.0)</span>
                                        </div>
                                        <strong>João Silva</strong>
                                        <p class="mb-1">Excelente evento! Superou minhas expectativas.</p>
                                        <small class="text-muted">2 dias atrás</small>
                                    </div>
                                </div>
                            </div>
                            <a href="${cadastroPath}?id=${evento.id}" class="btn btn-primary btn-lg w-100 mb-3">
                                <div class="mt-auto">
                                    <button class="btn btn-primary btn-lg w-100">Inscrever-se</button>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <div class="text-center">
                <a href="exibicaoeventos.html" class="btn btn-secondary btn-lg w-100">
                    <i class="fas fa-arrow-left me-2"></i>Voltar para Lista de Eventos
                </a>
            </div>
        `;
    } catch (error) {
        console.error('Erro ao carregar detalhes do evento:', error);
        document.getElementById('evento-detalhes').innerHTML = `
            <div class="alert alert-danger">
                Erro ao carregar detalhes do evento. Por favor, tente novamente mais tarde.<br>
                Erro: ${error.message}
            </div>
        `;
    }
}

// Carregar eventos quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    carregarEventos();
    carregarDetalhesEvento();
});
document.addEventListener("DOMContentLoaded", () => {
    const estrelas = document.querySelectorAll(".estrela");
    const comentarioInput = document.getElementById("comentario");
    const enviarBtn = document.getElementById("enviar-avaliacao");
    let notaSelecionada = 0;

    estrelas.forEach(estrela => {
        estrela.addEventListener("click", () => {
            notaSelecionada = parseInt(estrela.getAttribute("data-value"));

            // Resetar estrelas
            estrelas.forEach(e => e.classList.remove("selecionada"));

            // Marcar estrelas até a selecionada
            for (let i = 0; i < notaSelecionada; i++) {
                estrelas[i].classList.add("selecionada");
            }
        });
    });

    enviarBtn.addEventListener("click", () => {
        const comentario = comentarioInput.value.trim();

        if (notaSelecionada === 0 || comentario === "") {
            alert("Por favor, preencha uma nota e um comentário.");
            return;
        }

        const avaliacao = {
            estrelas: notaSelecionada,
            comentario: comentario,
            data: new Date().toLocaleString()
        };

        console.log("Avaliação enviada:", avaliacao);

        // Aqui depois faremos o POST no db.json com JSON Server.
        // Por enquanto só exibimos no console.
    });
});
