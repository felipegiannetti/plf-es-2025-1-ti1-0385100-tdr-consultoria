document.addEventListener("DOMContentLoaded", async () => {
    const gridContainer = document.getElementById("avaliacoes-grid");
    const searchBar = document.getElementById("search-bar");

    let avaliacoes = [];
    let eventos = [];

    try {
        // Fetch avaliações e eventos do servidor
        const avaliacoesResponse = await fetch("http://localhost:3000/avaliacoeseventos");
        avaliacoes = await avaliacoesResponse.json();

        const eventosResponse = await fetch("http://localhost:3000/eventos");
        eventos = await eventosResponse.json();

        // Renderiza todas as avaliações inicialmente
        renderAvaliacoes(avaliacoes, eventos);

        // Adiciona funcionalidade de pesquisa
        searchBar.addEventListener("input", () => {
            const searchTerm = searchBar.value.toLowerCase();
            const filteredAvaliacoes = avaliacoes.filter(avaliacao => {
                const evento = eventos.find(evento => evento.id === avaliacao.idevento);
                return evento && evento.titulo.toLowerCase().includes(searchTerm);
            });
            renderAvaliacoes(filteredAvaliacoes, eventos);
        });
    } catch (error) {
        console.error("Erro ao carregar as avaliações ou eventos:", error);
        gridContainer.innerHTML = `<p class="text-danger">Erro ao carregar as avaliações.</p>`;
    }

    function renderAvaliacoes(avaliacoes, eventos) {
        gridContainer.innerHTML = "";

        if (avaliacoes.length === 0) {
            gridContainer.innerHTML = `<p class="text-muted">Nenhuma avaliação encontrada.</p>`;
            return;
        }

        avaliacoes.forEach(avaliacao => {
            const evento = eventos.find(evento => evento.id === avaliacao.idevento);
            const card = document.createElement("div");
            card.className = "col-md-4";

            card.innerHTML = `
                <div class="card shadow-sm">
                    <div class="card-body">
                        <div class="stars mb-2">
                            ${"★".repeat(avaliacao.rating || 5)} 
                            <span class="text-muted">(${avaliacao.rating || 5}.0)</span>
                        </div>
                        <h5 class="card-title">${avaliacao.nome || "Anônimo"}</h5>
                        <p class="card-text">${avaliacao.comentario}</p>
                        <small class="text-muted">Evento: ${evento ? evento.titulo : "Evento não encontrado"}</small>
                    </div>
                </div>
            `;

            gridContainer.appendChild(card);
        });
    }
});