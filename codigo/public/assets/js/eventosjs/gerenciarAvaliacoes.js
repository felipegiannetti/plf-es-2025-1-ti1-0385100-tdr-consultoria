const API_URL = 'http://localhost:3000';
let currentAvaliacaoId = null;

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
        Swal.fire('Erro!', 'Erro ao carregar avaliações.', 'error');
    }
}

async function renderAvaliacoes(avaliacoes, eventos) {
    const tbody = document.getElementById('avaliacoesTable');
    tbody.innerHTML = '';

    // Sort avaliacoes by date, most recent first
    avaliacoes.sort((a, b) => new Date(b.data) - new Date(a.data));

    for (const avaliacao of avaliacoes) {
        try {
            // Fetch event details directly if not found in eventos array
            let evento = eventos.find(e => e.id === avaliacao.idevento);
            
            if (!evento) {
                const eventResponse = await fetch(`${API_URL}/eventos/${avaliacao.idevento}`);
                if (eventResponse.ok) {
                    evento = await eventResponse.json();
                    // Add to eventos array to avoid future fetches
                    eventos.push(evento);
                }
            }

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${avaliacao.nome}</td>
                <td>${evento ? evento.titulo : `Evento #${avaliacao.idevento}`}</td>
                <td>
                    <span style="color: gold">
                        ${'★'.repeat(avaliacao.rating)}${'☆'.repeat(5-avaliacao.rating)}
                    </span>
                </td>
                <td>${avaliacao.comentario.substring(0, 50)}${avaliacao.comentario.length > 50 ? '...' : ''}</td>
                <td>${new Date(avaliacao.data).toLocaleDateString()}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-info" onclick="viewAvaliacao('${avaliacao.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="confirmDelete('${avaliacao.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            tbody.appendChild(row);
        } catch (error) {
            console.error(`Erro ao processar avaliação ${avaliacao.id}:`, error);
        }
    }
}

async function viewAvaliacao(id) {
    try {
        const [avaliacaoResponse, eventosResponse] = await Promise.all([
            fetch(`${API_URL}/avaliacoeseventos/${id}`),
            fetch(`${API_URL}/eventos`)
        ]);

        const avaliacao = await avaliacaoResponse.json();
        const eventos = await eventosResponse.json();
        const evento = eventos.find(e => e.id === avaliacao.idevento);

        const modal = document.getElementById('avaliacaoDetails');
        currentAvaliacaoId = id;

        modal.innerHTML = `
            <div class="mb-3">
                <h6>Usuário</h6>
                <p>${avaliacao.nome}</p>
            </div>
            <div class="mb-3">
                <h6>Evento</h6>
                <p>${evento ? evento.titulo : 'Evento não encontrado'}</p>
            </div>
            <div class="mb-3">
                <h6>Avaliação</h6>
                <p style="color: gold">
                    ${'★'.repeat(avaliacao.rating)}${'☆'.repeat(5-avaliacao.rating)}
                    (${avaliacao.rating}.0)
                </p>
            </div>
            <div class="mb-3">
                <h6>Comentário</h6>
                <p>${avaliacao.comentario}</p>
            </div>
            <div class="mb-3">
                <h6>Data</h6>
                <p>${new Date(avaliacao.data).toLocaleString()}</p>
            </div>
        `;

        new bootstrap.Modal(document.getElementById('viewAvaliacaoModal')).show();
    } catch (error) {
        Swal.fire('Erro!', 'Erro ao carregar detalhes da avaliação.', 'error');
    }
}

function confirmDelete(id) {
    Swal.fire({
        title: 'Confirmar exclusão?',
        text: "Esta ação não pode ser desfeita!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sim, excluir!',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            deleteAvaliacao(id);
        }
    });
}

async function deleteAvaliacao(id = currentAvaliacaoId) {
    try {
        const response = await fetch(`${API_URL}/avaliacoeseventos/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            Swal.fire('Sucesso!', 'Avaliação excluída com sucesso.', 'success');
            loadAvaliacoes();
            const modal = bootstrap.Modal.getInstance(document.getElementById('viewAvaliacaoModal'));
            if (modal) modal.hide();
        } else {
            throw new Error('Erro ao excluir avaliação');
        }
    } catch (error) {
        Swal.fire('Erro!', 'Erro ao excluir avaliação.', 'error');
    }
}

function searchAvaliacoes() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const starFilter = document.getElementById('filterStars').value;
    
    fetch(`${API_URL}/avaliacoeseeventos`)
        .then(response => response.json())
        .then(avaliacoes => {
            const filtered = avaliacoes.filter(avaliacao => {
                const matchesSearch = avaliacao.nome.toLowerCase().includes(searchTerm) ||
                                   avaliacao.comentario.toLowerCase().includes(searchTerm);
                const matchesStars = starFilter === 'all' || avaliacao.rating === parseInt(starFilter);
                return matchesSearch && matchesStars;
            });
            
            fetch(`${API_URL}/eventos`)
                .then(response => response.json())
                .then(eventos => {
                    renderAvaliacoes(filtered, eventos);
                });
        })
        .catch(error => {
            Swal.fire('Erro!', 'Erro ao buscar avaliações.', 'error');
        });
}

function exportarAvaliacoes() {
    fetch(`${API_URL}/avaliacoeseventos`)
        .then(response => response.json())
        .then(avaliacoes => {
            const csvContent = "data:text/csv;charset=utf-8," 
                + "Nome,Evento,Avaliação,Comentário,Data\n"
                + avaliacoes.map(a => {
                    return `${a.nome},"${a.idevento}",${a.rating},"${a.comentario}","${new Date(a.data).toLocaleDateString()}"`;
                }).join("\n");

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "avaliacoes.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        })
        .catch(error => {
            Swal.fire('Erro!', 'Erro ao exportar avaliações.', 'error');
        });
}