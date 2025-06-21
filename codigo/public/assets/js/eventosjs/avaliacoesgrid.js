document.addEventListener("DOMContentLoaded", async () => {
    const gridContainer = document.getElementById("avaliacoes-grid");
    const searchBar = document.getElementById("search-bar");
    const starFilter = document.getElementById("star-filter");
    const API_URL = "http://localhost:3000";

    let avaliacoes = [];
    let eventos = [];

    async function loadData() {
        try {
            const [avaliacoesResponse, eventosResponse] = await Promise.all([
                fetch(`${API_URL}/avaliacoeseventos`),
                fetch(`${API_URL}/eventos`)
            ]);

            if (!avaliacoesResponse.ok || !eventosResponse.ok) {
                throw new Error('Erro ao carregar dados');
            }

            avaliacoes = await avaliacoesResponse.json();
            eventos = await eventosResponse.json();

            console.log('Dados carregados:', { avaliacoes, eventos });
            renderAvaliacoes(avaliacoes, eventos);
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
            gridContainer.innerHTML = `
                <div class="alert alert-danger">
                    Erro ao carregar avaliações. Por favor, verifique se o servidor está rodando.
                </div>`;
        }
    }

    function renderAvaliacoes(avaliacoes, eventos) {
        if (!Array.isArray(avaliacoes) || !Array.isArray(eventos)) {
            console.error('Dados inválidos:', { avaliacoes, eventos });
            return;
        }

        gridContainer.innerHTML = "";

        if (avaliacoes.length === 0) {
            gridContainer.innerHTML = `<p class="text-muted">Nenhuma avaliação encontrada.</p>`;
            return;
        }

        const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
        const isUserAdmin = usuarioLogado?.tipo === 'admin';

        avaliacoes.forEach(avaliacao => {
            const evento = eventos.find(e => String(e.id) === String(avaliacao.idevento));
            
            const card = document.createElement("div");
            card.className = "col-md-4 mb-4";
            
            card.innerHTML = `
                <div class="card h-100 shadow-sm">
                    <div class="card-body">
                        <div class="stars mb-3">
                            <span style="color: gold">${"★".repeat(avaliacao.rating || 0)}${"☆".repeat(5 - (avaliacao.rating || 0))}</span>
                            <span class="text-muted">(${avaliacao.rating || 0})</span>
                        </div>
                        <h5 class="card-title">${avaliacao.nome || "Anônimo"}</h5>
                        <p class="card-text">${avaliacao.comentario || ""}</p>
                        <small class="text-muted">Evento: ${evento?.titulo || "Evento não encontrado"}</small>
                    </div>
                </div>
            `;

            gridContainer.appendChild(card);
        });
    }

    // Initialize search and filter events
    searchBar?.addEventListener("input", () => {
        const filtered = filterAvaliacoes();
        renderAvaliacoes(filtered, eventos);
    });

    starFilter?.addEventListener("change", () => {
        const filtered = filterAvaliacoes();
        renderAvaliacoes(filtered, eventos);
    });

    function filterAvaliacoes() {
        const searchTerm = searchBar?.value?.toLowerCase() || "";
        const selectedStars = parseInt(starFilter?.value) || 0;

        return avaliacoes.filter(avaliacao => {
            const evento = eventos.find(e => String(e.id) === String(avaliacao.idevento));
            const matchesSearch = evento?.titulo?.toLowerCase()?.includes(searchTerm) || false;
            const matchesStars = !selectedStars || avaliacao.rating === selectedStars;
            return matchesSearch && matchesStars;
        });
    }

    // Load initial data
    await loadData();
});