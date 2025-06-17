document.addEventListener("DOMContentLoaded", async () => {
    const gridContainer = document.getElementById("avaliacoes-grid");
    const searchBar = document.getElementById("search-bar");
    const starFilter = document.getElementById("star-filter");

    let avaliacoes = [];
    let eventos = [];    try {
        // Fetch avaliações e eventos do servidor
        const [avaliacoesResponse, eventosResponse] = await Promise.all([
            fetch("http://localhost:3000/avaliacoeseventos"),
            fetch("http://localhost:3000/eventos")
        ]);

        if (!avaliacoesResponse.ok) {
            throw new Error(`HTTP error! status: ${avaliacoesResponse.status}`);
        }
        if (!eventosResponse.ok) {
            throw new Error(`HTTP error! status: ${eventosResponse.status}`);
        }

        avaliacoes = await avaliacoesResponse.json();
        eventos = await eventosResponse.json();

        console.log('Dados carregados:', {
            avaliacoes,
            eventos
        });

        // Renderiza todas as avaliações inicialmente
        renderAvaliacoes(avaliacoes, eventos);

        // Adiciona funcionalidade de pesquisa e filtro
        const applyFilters = () => {
            const searchTerm = searchBar.value.toLowerCase();
            const selectedStars = starFilter.value;            console.log('Aplicando filtros:');
            console.log('Termo de busca:', searchTerm);
            console.log('Filtro de estrelas:', selectedStars);
            console.log('Avaliações disponíveis:', avaliacoes);
            console.log('Eventos disponíveis:', eventos);

            const filteredAvaliacoes = avaliacoes.filter(avaliacao => {
                // Converte os IDs para string para garantir uma comparação consistente
                const evento = eventos.find(e => String(e.id) === String(avaliacao.idevento));
                
                // Log para debug
                console.log('Avaliando avaliação:', {
                    avaliacaoId: avaliacao.id,
                    eventoId: avaliacao.idevento,
                    eventoEncontrado: evento ? evento.titulo : 'não encontrado'
                });

                if (!evento) {
                    console.log(`Evento não encontrado para avaliação ${avaliacao.id}`);
                    return false;
                }

                const matchesEventName = evento.titulo.toLowerCase().includes(searchTerm);
                const matchesStarFilter = selectedStars ? Number(avaliacao.rating) === Number(selectedStars) : true;

                console.log('Resultado do filtro:', {
                    titulo: evento.titulo,
                    matchesEventName,
                    matchesStarFilter
                });

                return matchesEventName && matchesStarFilter;
            });

            renderAvaliacoes(filteredAvaliacoes, eventos);
        };

        searchBar.addEventListener("input", applyFilters);
        starFilter.addEventListener("change", applyFilters);
    } catch (error) {
        console.error("Erro ao carregar as avaliações ou eventos:", error);
        gridContainer.innerHTML = `<p class="text-danger">Erro ao carregar as avaliações.</p>`;
    }    function renderAvaliacoes(avaliacoes, eventos) {
        gridContainer.innerHTML = "";
        console.log('Renderizando avaliações:', avaliacoes);
        console.log('Eventos disponíveis:', eventos);

        if (avaliacoes.length === 0) {
            gridContainer.innerHTML = `<p class="text-muted">Nenhuma avaliação encontrada.</p>`;
            return;
        }

        avaliacoes.forEach(avaliacao => {
            console.log('Processando avaliação:', avaliacao);
            const evento = eventos.find(e => String(e.id) === String(avaliacao.idevento));
            console.log('Evento encontrado:', evento);
            
            const card = document.createElement("div");
            card.className = "col-md-4 position-relative";            card.innerHTML = `
                <div class="card shadow-sm" style="overflow:visible;">
                    <div class="card-body">                        <div class="stars mb-3">
                            ${"★".repeat(avaliacao.rating || 0)}${"☆".repeat(5 - (avaliacao.rating || 0))} 
                            <span class="text-muted">(${avaliacao.rating || 5}.0)</span>
                        </div>
                        <h5 class="card-title">${avaliacao.nome || "Anônimo"}</h5>
                        <p class="card-text">${avaliacao.comentario}</p>
                        <small class="text-muted">Evento: ${evento ? evento.titulo : "Evento não encontrado"}</small>
                        <div class="botoes-edicao" style="display:none; position:absolute; top:10px; right:10px; z-index:2;">
                            <button class="btn btn-sm btn-light btn-editar" title="Editar">
                                <i class="bi bi-pencil-square"></i>
                            </button>
                            <button class="btn btn-sm btn-light btn-excluir" title="Excluir">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;

            // Mostrar/ocultar botões ao passar o mouse
            const cardDiv = card.querySelector('.card');
            const botoes = card.querySelector('.botoes-edicao');
            cardDiv.addEventListener('mouseenter', () => {
                botoes.style.display = 'block';
            });
            cardDiv.addEventListener('mouseleave', () => {
                botoes.style.display = 'none';
            });

            // Evento de excluir
            botoes.querySelector('.btn-excluir').onclick = () => {
                if (confirm("Tem certeza que deseja excluir esta avaliação?")) {
                    fetch(`http://localhost:3000/avaliacoeseventos/${avaliacao.id}`, {
                        method: 'DELETE'
                    })
                    .then(res => {
                        if (res.ok) {
                            // Remove do array local e re-renderiza
                            avaliacoes = avaliacoes.filter(a => a.id !== avaliacao.id);
                            renderAvaliacoes(avaliacoes, eventos);
                        } else {
                            alert("Erro ao excluir.");
                        }
                    });
                }
            };

            // Evento de editar
            botoes.querySelector('.btn-editar').onclick = () => {
                const novoComentario = prompt("Edite o comentário:", avaliacao.comentario);
                if (novoComentario !== null) {
                    const novaNota = prompt("Edite a nota (1 a 5):", avaliacao.rating || 5);
                    if (novaNota !== null && novaNota >= 1 && novaNota <= 5) {
                        const novaAvaliacao = { ...avaliacao, comentario: novoComentario, rating: parseInt(novaNota) };
                        fetch(`http://localhost:3000/avaliacoeseventos/${avaliacao.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(novaAvaliacao)
                        })
                        .then(res => {
                            if (res.ok) {
                                // Atualiza no array local e re-renderiza
                                avaliacoes = avaliacoes.map(a => a.id === avaliacao.id ? novaAvaliacao : a);
                                renderAvaliacoes(avaliacoes, eventos);
                            } else {
                                alert("Erro ao editar.");
                            }
                        });
                    }
                }
            };

            gridContainer.appendChild(card);
        });
    }
});