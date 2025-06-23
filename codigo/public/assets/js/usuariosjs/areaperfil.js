const API_URL = 'http://localhost:3000';
let usuario = null;
let currentPage = 1;
const eventsPerPage = 4; // Changed from 10 to 4 to match quiz pagination
let totalEvents = 0;
const QUIZZES_PER_PAGE = 4; // Changed to 4 quizzes per page
let currentQuizPage = 1;

document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is logged in
    const usuarioLogado = localStorage.getItem('usuarioLogado');
    if (!usuarioLogado) {
        window.location.href = '../login/loginregistro.html';
        return;
    }

    usuario = JSON.parse(usuarioLogado);
    document.getElementById('userName').textContent = usuario.nome;

    // Load user's data
    await Promise.all([
        loadUserEvents(),
        loadUserQuizzes() // Add this line
    ]);

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
                <div class="col-12">
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

        // Calculate pagination
        const totalEvents = userEventos.length;
        const totalPages = Math.ceil(totalEvents / eventsPerPage);
        const startIndex = (page - 1) * eventsPerPage;
        const endIndex = Math.min(startIndex + eventsPerPage, totalEvents);
        const currentEvents = userEventos.slice(startIndex, endIndex);

        eventosGrid.innerHTML = `
            <div class="events-container">
                <div class="debug-info text-muted mb-3">
                    <small>Total de eventos: ${totalEvents} | Página atual: ${page} de ${totalPages}</small>
                </div>
                <ul class="event-list">
                    ${currentEvents.map((evento, index) => `
                        <li class="event-list-item">
                            <div class="event-header" onclick="toggleEventDetails('event-${startIndex + index}')">
                                <h5 class="event-title">
                                    <i class="fas fa-calendar-check me-2"></i>
                                    ${evento.titulo}
                                </h5>
                                <span class="event-date">
                                    <i class="far fa-calendar-alt me-1"></i>
                                    ${new Date(evento.data).toLocaleDateString('pt-BR')}
                                </span>
                            </div>
                            <div class="event-details" id="event-${startIndex + index}">
                                <div class="event-info">
                                    <p class="mb-2">${evento.descricao}</p>
                                    <div class="event-meta">
                                        <span class="badge bg-primary">${evento.categoria}</span>
                                        <span class="text-muted"><i class="fas fa-map-marker-alt me-1"></i>${evento.local}</span>
                                    </div>
                                </div>
                            </div>
                        </li>
                    `).join('')}
                </ul>
                ${totalPages > 1 ? `
                    <div class="pagination-container mt-4">
                        <ul class="pagination">
                            <li class="page-item ${page === 1 ? 'disabled' : ''}">
                                <button class="page-link" onclick="changeEventPage(${page - 1})" ${page === 1 ? 'disabled' : ''}>
                                    <i class="fas fa-chevron-left"></i>
                                </button>
                            </li>
                            ${Array.from({length: totalPages}, (_, i) => i + 1).map(num => `
                                <li class="page-item ${num === page ? 'active' : ''}">
                                    <button class="page-link" onclick="changeEventPage(${num})">${num}</button>
                                </li>
                            `).join('')}
                            <li class="page-item ${page === totalPages ? 'disabled' : ''}">
                                <button class="page-link" onclick="changeEventPage(${page + 1})" ${page === totalPages ? 'disabled' : ''}>
                                    <i class="fas fa-chevron-right"></i>
                                </button>
                            </li>
                        </ul>
                    </div>
                ` : ''}
            </div>
        `;

    } catch (error) {
        console.error('Erro ao carregar eventos:', error);
        document.getElementById('eventosGrid').innerHTML = `
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

    // Load quizzes when the tab is clicked
    document.querySelector('[data-target="quizzes"]').addEventListener('click', () => {
        loadUserQuizzes(currentQuizPage);
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

async function loadUserQuizzes(page = 1) {
    try {
        // First, let's debug the data we're receiving
        console.log('User data:', usuario);
        console.log('User quizzes:', usuario.idformulario);

        const quizzesResponse = await fetch(`${API_URL}/quizzes`);
        const allQuizzes = await quizzesResponse.json();
        const quizzesGrid = document.getElementById('quizzesGrid');

        if (!usuario.idformulario || usuario.idformulario.length === 0) {
            quizzesGrid.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i>
                        Você ainda não realizou nenhum quiz.
                    </div>
                </div>`;
            return;
        }

        // Calculate pagination
        const totalQuizzes = usuario.idformulario.length;
        const totalPages = Math.ceil(totalQuizzes / QUIZZES_PER_PAGE);
        const startIndex = (page - 1) * QUIZZES_PER_PAGE;
        const endIndex = Math.min(startIndex + QUIZZES_PER_PAGE, totalQuizzes);
        const currentQuizzes = usuario.idformulario.slice(startIndex, endIndex);

        // Render the quizzes list
        quizzesGrid.innerHTML = `
            <div class="quiz-container">
                <div class="debug-info text-muted mb-3">
                    <small>Total de quizzes: ${totalQuizzes} | Página atual: ${page} de ${totalPages}</small>
                </div>
                <ul class="quiz-list">
                    ${currentQuizzes.map((quizResponse, index) => {
                        const quiz = allQuizzes.find(q => q.id === quizResponse.idQuiz);
                        return `
                            <li class="quiz-list-item">
                                <div class="quiz-header" onclick="toggleQuizAnswers('quiz-${startIndex + index}')">
                                    <h5 class="quiz-title">
                                        <i class="fas fa-clipboard-check me-2"></i>
                                        ${quiz ? quiz.titulo : 'Quiz não encontrado'}
                                    </h5>
                                    <span class="quiz-date">
                                        <i class="far fa-calendar-alt me-1"></i>
                                        ${new Date(quizResponse.dataRealizacao).toLocaleDateString('pt-BR')}
                                    </span>
                                </div>
                                <div class="quiz-answers" id="quiz-${startIndex + index}">
                                    ${quizResponse.questions.map((q, qIndex) => `
                                        <div class="response-item">
                                            <strong class="d-block mb-1 text-muted">Pergunta ${qIndex + 1}:</strong>
                                            <p class="mb-1">${q.question}</p>
                                            <strong class="d-block mb-1 text-muted">Sua resposta:</strong>
                                            <p class="mb-0 text-primary">${q.response}</p>
                                        </div>
                                    `).join('')}
                                </div>
                            </li>
                        `;
                    }).join('')}
                </ul>
                ${totalPages > 1 ? `
                    <div class="pagination-container mt-4">
                        <ul class="pagination">
                            <li class="page-item ${page === 1 ? 'disabled' : ''}">
                                <button class="page-link" onclick="changeQuizPage(${page - 1})" ${page === 1 ? 'disabled' : ''}>
                                    <i class="fas fa-chevron-left"></i>
                                </button>
                            </li>
                            ${Array.from({length: totalPages}, (_, i) => i + 1).map(num => `
                                <li class="page-item ${num === page ? 'active' : ''}">
                                    <button class="page-link" onclick="changeQuizPage(${num})">${num}</button>
                                </li>
                            `).join('')}
                            <li class="page-item ${page === totalPages ? 'disabled' : ''}">
                                <button class="page-link" onclick="changeQuizPage(${page + 1})" ${page === totalPages ? 'disabled' : ''}>
                                    <i class="fas fa-chevron-right"></i>
                                </button>
                            </li>
                        </ul>
                    </div>
                ` : ''}
            </div>
        `;

    } catch (error) {
        console.error('Erro ao carregar quizzes:', error);
        document.getElementById('quizzesGrid').innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle me-2"></i>
                    Erro ao carregar seus quizzes: ${error.message}
                </div>
            </div>`;
    }
}

function toggleQuizAnswers(quizId) {
    const answersDiv = document.getElementById(quizId);
    answersDiv.classList.toggle('show');
}

function changeQuizPage(newPage) {
    currentQuizPage = newPage;
    loadUserQuizzes(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleEventDetails(eventId) {
    const detailsDiv = document.getElementById(eventId);
    detailsDiv.classList.toggle('show');
}

function changeEventPage(newPage) {
    currentPage = newPage;
    loadUserEvents(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}