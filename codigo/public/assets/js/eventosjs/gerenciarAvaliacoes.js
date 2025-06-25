const API_URL = '';
let currentAvaliacaoId = null;

// Carregar todas as avaliações e eventos
async function loadAvaliacoes() {
    try {
        const [avaliacoesResponse, eventosResponse] = await Promise.all([
            fetch(`${API_URL}/avaliacoeseventos`),
            fetch(`${API_URL}/eventos`)
        ]);

        const avaliacoes = await avaliacoesResponse.json();
        const eventos = await eventosResponse.json();

        renderAvaliacoes(avaliacoes, eventos);
    } catch (error) {
        console.error('Erro ao carregar avaliações:', error);
        Swal.fire({
            title: 'Erro!',
            text: 'Erro ao carregar avaliações.',
            icon: 'error',
            customClass: {
                popup: 'swal2-popup',
                confirmButton: 'swal-custom-button'
            }
        });
    }
}

// Renderizar a tabela de avaliações filtradas
async function renderAvaliacoes(avaliacoes, eventos) {
    const tbody = document.getElementById('avaliacoesTable');
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    tbody.innerHTML = '';

    if (avaliacoes.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-5">
                    <i class="fas fa-search fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">Nenhuma avaliação encontrada</h5>
                    ${searchTerm ? `<p class="text-muted">Tente outros termos ou limpe os filtros</p>` : ''}
                </td>
            </tr>
        `;
        return;
    }

    // Ordenar por data decrescente
    avaliacoes.sort((a, b) => new Date(b.data) - new Date(a.data));

    for (const avaliacao of avaliacoes) {
        try {
            let evento = eventos.find(e => e.id === avaliacao.idevento);

            if (!evento) {
                const eventResponse = await fetch(`${API_URL}/eventos/${avaliacao.idevento}`);
                if (eventResponse.ok) {
                    evento = await eventResponse.json();
                    eventos.push(evento);
                }
            }

            const eventoTitulo = evento ? evento.titulo : `Evento #${avaliacao.idevento}`;
            const highlightedNome = highlightSearchTerm(avaliacao.nome, searchTerm);
            const highlightedEvento = highlightSearchTerm(eventoTitulo, searchTerm);
            const highlightedComentario = highlightSearchTerm(avaliacao.comentario, searchTerm);

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${highlightedNome}</td>
                <td>
                    <span title="${eventoTitulo}">${highlightedEvento}</span>
                    ${evento ? `<small class="d-block text-muted">ID: ${evento.id}</small>` : ''}
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <span style="color: gold; font-size: 1.2em; margin-right: 8px;">
                            ${'★'.repeat(avaliacao.rating)}${'☆'.repeat(5 - avaliacao.rating)}
                        </span>
                        <small class="text-muted">(${avaliacao.rating}/5)</small>
                    </div>
                </td>
                <td>
                    <span title="${avaliacao.comentario}" style="cursor: help;">
                        ${highlightedComentario.substring(0, 50)}${avaliacao.comentario.length > 50 ? '...' : ''}
                    </span>
                </td>
                <td>
                    <span title="${new Date(avaliacao.data).toLocaleString('pt-BR')}">
                        ${new Date(avaliacao.data).toLocaleDateString('pt-BR')}
                    </span>
                </td>
                <td class="text-center">
                    <div class="btn-group">
                        <button class="btn btn-sm btn-info" onclick="viewAvaliacao('${avaliacao.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="confirmDelete('${avaliacao.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        } catch (error) {
            console.error(`Erro ao processar avaliação ${avaliacao.id}:`, error);
        }
    }
}

// ✅ Função de busca e filtro por estrelas — corrigida e funcional
async function searchAvaliacoes() {
    const searchInput = document.getElementById('searchInput');
    const starFilter = document.getElementById('filterStars');

    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const starValue = starFilter ? starFilter.value : 'all';

    try {
        const [avaliacoesResponse, eventosResponse] = await Promise.all([
            fetch(`${API_URL}/avaliacoeseventos`),
            fetch(`${API_URL}/eventos`)
        ]);

        const avaliacoes = await avaliacoesResponse.json();
        const eventos = await eventosResponse.json();

        // Filtro combinado
        const filtered = avaliacoes.filter(avaliacao => {
            const evento = eventos.find(e => e.id === avaliacao.idevento);
            const eventoTitulo = evento ? evento.titulo.toLowerCase() : '';

            const matchesSearch =
                !searchTerm ||
                avaliacao.nome.toLowerCase().includes(searchTerm) ||
                avaliacao.comentario.toLowerCase().includes(searchTerm) ||
                eventoTitulo.includes(searchTerm);

            const matchesStars =
                starValue === 'all' || avaliacao.rating === parseInt(starValue);

            return matchesSearch && matchesStars;
        });

        renderAvaliacoes(filtered, eventos);

        // Info de feedback
        const searchInfo = document.getElementById('searchInfo');
        if (searchInfo) {
            if (filtered.length === 0 && (searchTerm || starValue !== 'all')) {
                searchInfo.innerHTML = `<small class="text-danger">Nenhuma avaliação encontrada</small>`;
            } else if (searchTerm || starValue !== 'all') {
                searchInfo.innerHTML = `<small class="text-info">Mostrando ${filtered.length} de ${avaliacoes.length} avaliações</small>`;
            } else {
                searchInfo.innerHTML = '';
            }
        }

    } catch (error) {
        console.error('Erro na pesquisa:', error);
        Swal.fire({
            title: 'Erro!',
            text: 'Erro ao buscar avaliações.',
            icon: 'error',
            customClass: {
                popup: 'swal2-popup',
                confirmButton: 'swal-custom-button'
            }
        });
    }
}

// ✅ Limpar filtros
function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('filterStars').value = 'all';
    const searchInfo = document.getElementById('searchInfo');
    if (searchInfo) searchInfo.innerHTML = '';
    
    loadAvaliacoes();
    
    Swal.fire({
        title: 'Filtros limpos!',
        text: 'Mostrando todas as avaliações.',
        icon: 'info',
        timer: 1500,
        showConfirmButton: false,
        customClass: {
            popup: 'swal2-popup'
        }
    });
}

// ✅ Destacar termos
function highlightSearchTerm(text, searchTerm) {
    if (!searchTerm || !text) return text;
    try {
        const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.replace(regex, '<mark class="bg-warning">$1</mark>');
    } catch (e) {
        return text;
    }
}

// ✅ Visualizar detalhes
async function viewAvaliacao(id) {
    try {
        const [avaliacaoResponse, eventosResponse] = await Promise.all([
            fetch(`${API_URL}/avaliacoeseventos/${id}`),
            fetch(`${API_URL}/eventos`)
        ]);

        if (!avaliacaoResponse.ok) throw new Error('Avaliação não encontrada');

        const avaliacao = await avaliacaoResponse.json();
        const eventos = await eventosResponse.json();
        const evento = eventos.find(e => e.id === avaliacao.idevento);

        const modalBody = document.getElementById('avaliacaoDetails');
        currentAvaliacaoId = id;

        modalBody.innerHTML = `
            <div class="mb-3">
                <h6><i class="fas fa-user me-2"></i>Usuário</h6>
                <p class="ms-3">${avaliacao.nome}</p>
            </div>
            <div class="mb-3">
                <h6><i class="fas fa-calendar me-2"></i>Evento</h6>
                <p class="ms-3">${evento ? evento.titulo : 'Evento não encontrado'}</p>
            </div>
            <div class="mb-3">
                <h6><i class="fas fa-star me-2"></i>Avaliação</h6>
                <p class="ms-3" style="color: gold; font-size: 1.5em;">
                    ${'★'.repeat(avaliacao.rating)}${'☆'.repeat(5-avaliacao.rating)}
                    <span class="text-dark ms-2">(${avaliacao.rating}/5)</span>
                </p>
            </div>
            <div class="mb-3">
                <h6><i class="fas fa-comment me-2"></i>Comentário</h6>
                <div class="ms-3 p-3 bg-light rounded">
                    <p class="mb-0 text-dark">${avaliacao.comentario}</p>
                </div>
            </div>
            <div class="mb-3">
                <h6><i class="fas fa-clock me-2"></i>Data</h6>
                <p class="ms-3">${new Date(avaliacao.data).toLocaleString('pt-BR')}</p>
            </div>
        `;

        new bootstrap.Modal(document.getElementById('viewAvaliacaoModal')).show();

    } catch (error) {
        console.error('Erro:', error);
        Swal.fire({
            title: 'Erro!',
            text: 'Erro ao carregar detalhes da avaliação.',
            icon: 'error',
            customClass: {
                popup: 'swal2-popup',
                confirmButton: 'swal-custom-button'
            }
        });
    }
}

// ✅ Confirmar exclusão
function confirmDelete(id) {
    Swal.fire({
        title: 'Confirmar exclusão?',
        text: "Esta ação não pode ser desfeita!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, excluir!',
        cancelButtonText: 'Cancelar',
        customClass: {
            popup: 'swal2-popup',
            confirmButton: 'swal-custom-button',
            cancelButton: 'swal-custom-button'
        }
    }).then(result => {
        if (result.isConfirmed) deleteAvaliacao(id);
    });
}

// ✅ Excluir avaliação
async function deleteAvaliacao(id = currentAvaliacaoId) {
    try {
        const response = await fetch(`${API_URL}/avaliacoeseventos/${id}`, { 
            method: 'DELETE' 
        });
        
        if (!response.ok) throw new Error('Erro ao excluir');

        await Swal.fire({
            title: 'Sucesso!',
            text: 'Avaliação excluída com sucesso.',
            icon: 'success',
            customClass: {
                popup: 'swal2-popup',
                confirmButton: 'swal-custom-button'
            }
        });

        loadAvaliacoes();
        const modal = bootstrap.Modal.getInstance(document.getElementById('viewAvaliacaoModal'));
        if (modal) modal.hide();

    } catch (error) {
        console.error('Erro:', error);
        await Swal.fire({
            title: 'Erro!',
            text: 'Não foi possível excluir a avaliação.',
            icon: 'error',
            customClass: {
                popup: 'swal2-popup',
                confirmButton: 'swal-custom-button'
            }
        });
    }
}

// ✅ Exportar CSV
async function exportarAvaliacoes() {
    try {
        const [avaliacoesResponse, eventosResponse] = await Promise.all([
            fetch(`${API_URL}/avaliacoeseventos`),
            fetch(`${API_URL}/eventos`)
        ]);

        const avaliacoes = await avaliacoesResponse.json();
        const eventos = await eventosResponse.json();

        const csv = "Nome,Evento,Avaliação,Comentário,Data\n" +
            avaliacoes.map(a => {
                const evento = eventos.find(e => e.id === a.idevento);
                const eventoTitulo = evento ? evento.titulo : `Evento #${a.idevento}`;
                return `"${a.nome}","${eventoTitulo}",${a.rating},"${a.comentario.replace(/"/g, '""')}","${new Date(a.data).toLocaleDateString('pt-BR')}"`;
            }).join("\n");

        const link = document.createElement("a");
        link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
        link.download = 'avaliacoes.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        Swal.fire({
            title: 'Sucesso!',
            text: 'Avaliações exportadas.',
            icon: 'success'
        });

    } catch (error) {
        console.error('Erro:', error);
        Swal.fire({
            title: 'Erro!',
            text: 'Erro ao exportar.',
            icon: 'error'
        });
    }
}
