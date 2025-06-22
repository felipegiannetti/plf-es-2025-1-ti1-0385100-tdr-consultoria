const API_URL = 'http://localhost:3000';
let usuario = null;
let currentPage = 1;
const eventsPerPage = 10;
let totalEvents = 0;

document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is logged in
    const usuarioLogado = localStorage.getItem('usuarioLogado');
    if (!usuarioLogado) {
        window.location.href = '../login/loginregistro.html';
        return;
    }

    usuario = JSON.parse(usuarioLogado);
    document.getElementById('userName').textContent = usuario.nome;

    // Load user's events
    await loadUserEvents();

    // Setup navigation
    setupNavigation();

    // Setup form handlers
    setupPasswordForm();
    setupDeleteForm();
});

async function loadUserEvents(page = 1) {
    try {
        const [inscricoesResponse, eventosResponse] = await Promise.all([
            fetch(`${API_URL}/cadastroDeEventos`),
            fetch(`${API_URL}/eventos`)
        ]);

        const inscricoes = await inscricoesResponse.json();
        const eventos = await eventosResponse.json();
        const eventosGrid = document.getElementById('eventosGrid');

        // Filter inscricoes where user ID is in the idUsuario array
        const userInscricoes = inscricoes.filter(inscricao => 
            Array.isArray(inscricao.idUsuario) && 
            inscricao.idUsuario.includes(usuario.id)
        );

        if (!userInscricoes || userInscricoes.length === 0) {
            eventosGrid.innerHTML = `
                <div class="col-12 text-center">
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i>
                        Você ainda não está inscrito em nenhum evento.
                    </div>
                </div>`;
            return;
        }

        // Get events that user is registered for
        const userEventos = eventos.filter(evento => 
            userInscricoes.some(inscricao => inscricao.idEvento === evento.id)
        );

        totalEvents = userEventos.length;
        const totalPages = Math.ceil(totalEvents / eventsPerPage);
        const startIndex = (page - 1) * eventsPerPage;
        const endIndex = startIndex + eventsPerPage;
        const paginatedEventos = userEventos.slice(startIndex, endIndex);

        eventosGrid.innerHTML = `
            <div class="row">
                ${paginatedEventos.map(evento => `
                    <div class="col-md-6 mb-4">
                        <div class="card h-100 animate-card">
                            <div class="card-body">
                                <h5 class="card-title">${evento.titulo}</h5>
                                <p class="card-text">${evento.descricao}</p>
                                <div class="d-flex justify-content-between align-items-center">
                                    <span class="badge bg-primary">${evento.categoria}</span>
                                    <span class="text-muted">${new Date(evento.data).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            ${totalPages > 1 ? `
                <div class="pagination-container mt-4 d-flex justify-content-center">
                    <nav aria-label="Navegação de eventos">
                        <ul class="pagination">
                            ${generatePaginationHTML(page, totalPages)}
                        </ul>
                    </nav>
                </div>
            ` : ''}
        `;

    } catch (error) {
        console.error('Erro ao carregar eventos:', error);
        eventosGrid.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle me-2"></i>
                    Erro ao carregar seus eventos: ${error.message}
                </div>
            </div>`;
    }
}

function generatePaginationHTML(currentPage, totalPages) {
    let html = '';
    
    // Previous button
    html += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage - 1}" aria-label="Anterior">
                <span aria-hidden="true">&laquo;</span>
            </a>
        </li>
    `;

    // Generate page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (
            i === 1 || // First page
            i === totalPages || // Last page
            (i >= currentPage - 1 && i <= currentPage + 1) // Pages around current
        ) {
            html += `
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `;
        } else if (
            i === currentPage - 2 ||
            i === currentPage + 2
        ) {
            html += `
                <li class="page-item disabled">
                    <span class="page-link">...</span>
                </li>
            `;
        }
    }

    // Next button
    html += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage + 1}" aria-label="Próximo">
                <span aria-hidden="true">&raquo;</span>
            </a>
        </li>
    `;

    return html;
}

function setupNavigation() {
    document.querySelectorAll('.list-group-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Update active state
            document.querySelectorAll('.list-group-item').forEach(i => 
                i.classList.remove('active'));
            item.classList.add('active');

            // Show correct section
            const target = item.getAttribute('data-target');
            document.querySelectorAll('.content-section').forEach(section => 
                section.classList.remove('active'));
            document.getElementById(target).classList.add('active');
        });
    });
}

function setupPasswordForm() {
    document.getElementById('changePasswordForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword !== confirmPassword) {
            Swal.fire('Erro!', 'As senhas não coincidem.', 'error');
            return;
        }

        if (currentPassword !== usuario.senha) {
            Swal.fire('Erro!', 'Senha atual incorreta.', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/usuarios/${usuario.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ senha: newPassword })
            });

            if (response.ok) {
                usuario.senha = newPassword;
                localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
                Swal.fire('Sucesso!', 'Senha alterada com sucesso.', 'success');
                e.target.reset();
            } else {
                throw new Error('Erro ao alterar senha');
            }
        } catch (error) {
            Swal.fire('Erro!', 'Não foi possível alterar a senha.', 'error');
        }
    });
}

function setupDeleteForm() {
    document.getElementById('deleteAccountForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const confirmPassword = document.getElementById('deleteConfirmPassword').value;

        if (confirmPassword !== usuario.senha) {
            Swal.fire('Erro!', 'Senha incorreta.', 'error');
            return;
        }

        const result = await Swal.fire({
            title: 'Tem certeza?',
            text: "Esta ação não pode ser desfeita!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sim, deletar!',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`${API_URL}/usuarios/${usuario.id}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    localStorage.removeItem('usuarioLogado');
                    Swal.fire('Conta Deletada!', 'Sua conta foi removida com sucesso.', 'success')
                        .then(() => {
                            window.location.href = '../login/loginregistro.html';
                        });
                } else {
                    throw new Error('Erro ao deletar conta');
                }
            } catch (error) {
                Swal.fire('Erro!', 'Não foi possível deletar sua conta.', 'error');
            }
        }
    });
}