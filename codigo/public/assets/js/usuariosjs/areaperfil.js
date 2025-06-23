const API_URL = 'http://localhost:3000';
let usuario = null;
let currentPage = 1;
const eventsPerPage = 4; // Changed from 10 to 4 to match quiz pagination
let totalEvents = 0;
const QUIZZES_PER_PAGE = 4; // Changed to 4 quizzes per page
let currentQuizPage = 1;
let currentInvestmentPage = 1;
const MONTHS_PER_PAGE = 12;
let investmentResults = [];

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
    setupInvestmentCalculator(); // Adicione esta linha
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
                                    <div class="event-actions mt-3">
                                        <a href="../eventos/qrcodeEvento.html?id=${evento.id}" class="btn btn-outline-primary btn-sm">
                                            <i class="fas fa-qrcode me-1"></i>Ver QR Code
                                        </a>
                                        <button class="btn btn-outline-danger btn-sm ms-2" onclick="cancelInscricao('${evento.id}', '${evento.titulo}')">
                                            <i class="fas fa-times me-1"></i>Cancelar Inscrição
                                        </button>
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

// Adicione esta nova função para cancelar inscrição:
async function cancelInscricao(eventoId, eventoTitulo) {
    try {
        // Confirm cancellation
        const result = await Swal.fire({
            title: 'Cancelar Inscrição?',
            text: `Tem certeza que deseja cancelar sua inscrição no evento "${eventoTitulo}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sim, cancelar',
            cancelButtonText: 'Não, manter',
            customClass: {
                popup: 'swal2-popup',
                confirmButton: 'swal-custom-button',
                cancelButton: 'swal-custom-button'
            }
        });

        if (!result.isConfirmed) return;

        // Show loading with custom styling
        Swal.fire({
            title: 'Processando...',
            html: `
                <div style="display: flex; flex-direction: column; align-items: center; gap: 15px;">
                    <div class="loading-spinner"></div>
                    <p>Cancelando sua inscrição</p>
                    <div class="progress-bar">
                        <div class="progress-fill-cancel"></div>
                    </div>
                </div>
            `,
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            customClass: {
                popup: 'swal2-popup'
            },
            didOpen: () => {
                const style = document.createElement('style');
                style.innerHTML = `
                    .loading-spinner {
                        width: 40px;
                        height: 40px;
                        border: 4px solid #f3f3f3;
                        border-top: 4px solid #ff7a00;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                    }
                    
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    
                    .progress-bar {
                        width: 200px;
                        height: 8px;
                        background: #f3f3f3;
                        border-radius: 4px;
                        overflow: hidden;
                    }
                    
                    .progress-fill-cancel {
                        height: 100%;
                        background: linear-gradient(90deg, #ff7a00, #ff9a2e);
                        width: 0%;
                        border-radius: 4px;
                        animation: fillProgressCancel 3s ease-in-out forwards;
                    }
                    
                    @keyframes fillProgressCancel {
                        0% { width: 0%; }
                        100% { width: 100%; }
                    }
                `;
                document.head.appendChild(style);
            }
        });

        // Get current registration
        const inscricoesRes = await fetch(`${API_URL}/cadastroDeEventos?idEvento=${eventoId}`);
        const inscricoes = await inscricoesRes.json();
        const inscricao = inscricoes.find(i => i.idUsuario.includes(usuario.id));

        if (inscricao) {
            // Remove user from registration
            const updatedUsuarios = inscricao.idUsuario.filter(id => id !== usuario.id);
            
            if (updatedUsuarios.length === 0) {
                // If no users left, delete the registration
                await fetch(`${API_URL}/cadastroDeEventos/${inscricao.id}`, {
                    method: 'DELETE'
                });
            } else {
                // Update with remaining users
                await fetch(`${API_URL}/cadastroDeEventos/${inscricao.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...inscricao,
                        idUsuario: updatedUsuarios
                    })
                });
            }

            // Wait for animation to complete
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Show success message with custom styling
            await Swal.fire({
                title: 'Inscrição Cancelada!',
                text: `Sua inscrição no evento "${eventoTitulo}" foi cancelada com sucesso.`,
                icon: 'success',
                confirmButtonText: 'OK',
                timer: 3000,
                timerProgressBar: true,
                customClass: {
                    popup: 'swal2-popup',
                    confirmButton: 'swal-custom-button',
                    timerProgressBar: 'swal2-timer-progress-bar'
                }
            });

            // Reload events list
            await loadUserEvents(currentPage);
        }
    } catch (error) {
        console.error('Erro ao cancelar inscrição:', error);
        await Swal.fire({
            title: 'Erro!',
            text: 'Erro ao cancelar inscrição: ' + error.message,
            icon: 'error',
            confirmButtonText: 'OK',
            customClass: {
                popup: 'swal2-popup',
                confirmButton: 'swal-custom-button'
            }
        });
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
            Swal.fire({
                title: 'Erro!',
                text: 'As senhas não coincidem.',
                icon: 'error',
                customClass: {
                    popup: 'swal2-popup',
                    confirmButton: 'swal-custom-button'
                }
            });
            return;
        }

        if (currentPassword !== usuario.senha) {
            Swal.fire({
                title: 'Erro!',
                text: 'Senha atual incorreta.',
                icon: 'error',
                customClass: {
                    popup: 'swal2-popup',
                    confirmButton: 'swal-custom-button'
                }
            });
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
                Swal.fire({
                    title: 'Sucesso!',
                    text: 'Senha alterada com sucesso.',
                    icon: 'success',
                    customClass: {
                        popup: 'swal2-popup',
                        confirmButton: 'swal-custom-button'
                    }
                });
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
            confirmButtonText: 'Sim, deletar!',
            cancelButtonText: 'Cancelar',
            customClass: {
                popup: 'swal2-popup',
                confirmButton: 'swal-custom-button',
                cancelButton: 'swal-custom-button'
            }
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

// Adicione esta nova função:
function setupInvestmentCalculator() {
    // Adicionar estilos customizados para o botão
    const style = document.createElement('style');
    style.innerHTML = `
        .btn-calculate {
            background: linear-gradient(135deg, #ff7a00 0%, #ff9a2e 100%);
            border: none;
            color: white;
            padding: 0.75rem 2rem;
            font-weight: 500;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(255, 122, 0, 0.3);
            width: 100%;
            font-size: 0.9rem;
        }

        .btn-calculate:hover {
            background: linear-gradient(135deg, #ff9a2e 0%, #ffb366 100%);
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(255, 122, 0, 0.4);
            color: white;
        }

        .btn-calculate:active {
            transform: translateY(0);
            box-shadow: 0 4px 12px rgba(255, 122, 0, 0.3);
        }

        .btn-calculate:focus {
            outline: none;
            box-shadow: 0 0 0 3px rgba(255, 122, 0, 0.3);
        }

        .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #ff7a00;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .progress-bar {
            width: 200px;
            height: 8px;
            background: #f3f3f3;
            border-radius: 4px;
            overflow: hidden;
        }

        /* Responsivo para mobile */
        @media (max-width: 768px) {
            .btn-calculate {
                padding: 1rem 2rem;
                font-size: 1rem;
            }
        }
    `;
    document.head.appendChild(style);

    const form = document.getElementById('investmentForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const valorInicial = parseFloat(document.getElementById('valorInicial').value);
            const taxaAnual = parseFloat(document.getElementById('taxaAnual').value);
            const periodoMeses = parseInt(document.getElementById('periodoMeses').value);
            
            if (!valorInicial || !taxaAnual || !periodoMeses) {
                await Swal.fire({
                    title: 'Erro!',
                    text: 'Por favor, preencha todos os campos.',
                    icon: 'error',
                    confirmButtonText: 'OK',
                    customClass: {
                        popup: 'swal2-popup',
                        confirmButton: 'swal-custom-button'
                    }
                });
                return;
            }

            if (valorInicial <= 0 || taxaAnual < 0 || periodoMeses <= 0) {
                await Swal.fire({
                    title: 'Erro!',
                    text: 'Por favor, insira valores válidos.',
                    icon: 'error',
                    confirmButtonText: 'OK',
                    customClass: {
                        popup: 'swal2-popup',
                        confirmButton: 'swal-custom-button'
                    }
                });
                return;
            }

            // Show loading
            Swal.fire({
                title: 'Calculando...',
                html: `
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 15px;">
                        <div class="loading-spinner"></div>
                        <p>Processando seu investimento</p>
                        <div class="progress-bar">
                            <div class="progress-fill-investment"></div>
                        </div>
                    </div>
                `,
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                customClass: {
                    popup: 'swal2-popup'
                },
                didOpen: () => {
                    const loadingStyle = document.createElement('style');
                    loadingStyle.innerHTML = `
                        .progress-fill-investment {
                            height: 100%;
                            background: linear-gradient(90deg, #ff7a00, #ff9a2e);
                            width: 0%;
                            border-radius: 4px;
                            animation: fillProgressInvestment 2s ease-in-out forwards;
                        }
                        
                        @keyframes fillProgressInvestment {
                            0% { width: 0%; }
                            100% { width: 100%; }
                        }
                    `;
                    document.head.appendChild(loadingStyle);
                }
            });

            // Calculate investment
            await new Promise(resolve => setTimeout(resolve, 2000));
            calculateInvestment(valorInicial, taxaAnual, periodoMeses);
            
            Swal.close();
        });
    }
}

function calculateInvestment(valorInicial, taxaAnual, periodoMeses) {
    const taxaMensal = taxaAnual / 12 / 100;
    investmentResults = [];
    
    let valorAtual = valorInicial;
    
    for (let mes = 1; mes <= periodoMeses; mes++) {
        valorAtual = valorAtual * (1 + taxaMensal);
        const rendimento = valorAtual - valorInicial;
        
        investmentResults.push({
            mes: mes,
            valorTotal: valorAtual,
            rendimento: rendimento,
            percentualGanho: ((valorAtual - valorInicial) / valorInicial) * 100
        });
    }
    
    // Reset to first page
    currentInvestmentPage = 1;
    
    // Show results
    displayInvestmentResults(valorInicial, taxaAnual, periodoMeses);
}

function displayInvestmentResults(valorInicial, taxaAnual, periodoMeses) {
    const resultsDiv = document.getElementById('investmentResults');
    const valorFinal = investmentResults[investmentResults.length - 1];
    const rendimentoTotal = valorFinal.valorTotal - valorInicial;
    
    // Calculate pagination
    const totalPages = Math.ceil(investmentResults.length / MONTHS_PER_PAGE);
    
    // Check if table was previously visible
    const wasTableVisible = sessionStorage.getItem('investmentTableVisible') === 'true';
    const tableDisplay = wasTableVisible ? 'block' : 'none';
    const buttonText = wasTableVisible ? 
        '<i class="fas fa-table me-2"></i>Ocultar Tabela <i class="fas fa-chevron-up ms-2"></i>' : 
        '<i class="fas fa-table me-2"></i>Ver Tabela Detalhada <i class="fas fa-chevron-down ms-2"></i>';

    resultsDiv.innerHTML = `
        <div class="investment-summary mb-4 mt-4">
            <div class="row">
                <div class="col-md-3">
                    <div class="summary-card bg-primary">
                        <h6>Valor Inicial</h6>
                        <h4 title="R$ ${valorInicial.toLocaleString('pt-BR', {minimumFractionDigits: 2})}">
                            R$ ${valorInicial.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                        </h4>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="summary-card bg-success">
                        <h6>Valor Final</h6>
                        <h4 title="R$ ${valorFinal.valorTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}">
                            R$ ${valorFinal.valorTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                        </h4>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="summary-card bg-info">
                        <h6>Rendimento Total</h6>
                        <h4 title="R$ ${rendimentoTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}">
                            R$ ${rendimentoTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                        </h4>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="summary-card bg-warning">
                        <h6>% de Ganho</h6>
                        <h4 title="${valorFinal.percentualGanho.toFixed(2)}%">
                            ${valorFinal.percentualGanho.toFixed(2)}%
                        </h4>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="table-toggle-container">
            <button class="btn btn-outline-primary btn-block" onclick="toggleInvestmentTable()" id="toggleTableBtn">
                ${buttonText}
            </button>
        </div>
        
        <div class="investment-table-container" id="investmentTableContainer" style="display: ${tableDisplay};">
            <div class="table-responsive mt-3">
                <table class="table table-striped table-hover">
                    <thead class="table-dark">
                        <tr>
                            <th>Mês</th>
                            <th>Valor Total</th>
                            <th>Rendimento</th>
                            <th>% Ganho</th>
                        </tr>
                    </thead>
                    <tbody id="investmentTableBody">
                        <!-- Será preenchido pelo JavaScript -->
                    </tbody>
                </table>
                
                ${totalPages > 1 ? `
                    <div class="pagination-container mt-3">
                        <ul class="pagination justify-content-center">
                            <li class="page-item ${currentInvestmentPage === 1 ? 'disabled' : ''}">
                                <button class="page-link" onclick="changeInvestmentPage(${currentInvestmentPage - 1})" ${currentInvestmentPage === 1 ? 'disabled' : ''}>
                                    <i class="fas fa-chevron-left"></i>
                                </button>
                            </li>
                            ${Array.from({length: totalPages}, (_, i) => i + 1).map(num => `
                                <li class="page-item ${num === currentInvestmentPage ? 'active' : ''}">
                                    <button class="page-link" onclick="changeInvestmentPage(${num})">${num}</button>
                                </li>
                            `).join('')}
                            <li class="page-item ${currentInvestmentPage === totalPages ? 'disabled' : ''}">
                                <button class="page-link" onclick="changeInvestmentPage(${currentInvestmentPage + 1})" ${currentInvestmentPage === totalPages ? 'disabled' : ''}>
                                    <i class="fas fa-chevron-right"></i>
                                </button>
                            </li>
                        </ul>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    // Load current page of table
    loadInvestmentTablePage(currentInvestmentPage);
    
    // Show results section
    resultsDiv.style.display = 'block';
}

function loadInvestmentTablePage(page) {
    const startIndex = (page - 1) * MONTHS_PER_PAGE;
    const endIndex = Math.min(startIndex + MONTHS_PER_PAGE, investmentResults.length);
    const pageResults = investmentResults.slice(startIndex, endIndex);
    
    const tableBody = document.getElementById('investmentTableBody');
    if (tableBody) {
        tableBody.innerHTML = pageResults.map(result => `
            <tr>
                <td><strong>${result.mes}º mês</strong></td>
                <td class="text-success"><strong>R$ ${result.valorTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong></td>
                <td class="text-info">R$ ${result.rendimento.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                <td class="text-warning">${result.percentualGanho.toFixed(2)}%</td>
            </tr>
        `).join('');
    }
}

function toggleInvestmentTable() {
    const tableContainer = document.getElementById('investmentTableContainer');
    const toggleBtn = document.getElementById('toggleTableBtn');
    
    if (tableContainer.style.display === 'none' || tableContainer.style.display === '') {
        tableContainer.style.display = 'block';
        toggleBtn.innerHTML = '<i class="fas fa-table me-2"></i>Ocultar Tabela <i class="fas fa-chevron-up ms-2"></i>';
        
        // Store table state
        sessionStorage.setItem('investmentTableVisible', 'true');
    } else {
        tableContainer.style.display = 'none';
        toggleBtn.innerHTML = '<i class="fas fa-table me-2"></i>Ver Tabela Detalhada <i class="fas fa-chevron-down ms-2"></i>';
        
        // Store table state
        sessionStorage.setItem('investmentTableVisible', 'false');
    }
}

function changeInvestmentPage(newPage) {
    // Check if table is currently visible
    const tableContainer = document.getElementById('investmentTableContainer');
    const isTableVisible = tableContainer && tableContainer.style.display !== 'none';
    
    currentInvestmentPage = newPage;
    loadInvestmentTablePage(newPage);
    
    // Update only the pagination without recreating the entire results
    updateInvestmentPagination();
    
    // Keep table visible if it was visible before
    if (isTableVisible && tableContainer) {
        tableContainer.style.display = 'block';
        const toggleBtn = document.getElementById('toggleTableBtn');
        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="fas fa-table me-2"></i>Ocultar Tabela <i class="fas fa-chevron-up ms-2"></i>';
        }
    }
}

// Adicione esta nova função para atualizar apenas a paginação:
function updateInvestmentPagination() {
    const totalPages = Math.ceil(investmentResults.length / MONTHS_PER_PAGE);
    const paginationContainer = document.querySelector('.pagination-container');
    
    if (paginationContainer && totalPages > 1) {
        const paginationHTML = `
            <ul class="pagination justify-content-center">
                <li class="page-item ${currentInvestmentPage === 1 ? 'disabled' : ''}">
                    <button class="page-link" onclick="changeInvestmentPage(${currentInvestmentPage - 1})" ${currentInvestmentPage === 1 ? 'disabled' : ''}>
                        <i class="fas fa-chevron-left"></i>
                    </button>
                </li>
                ${Array.from({length: totalPages}, (_, i) => i + 1).map(num => `
                    <li class="page-item ${num === currentInvestmentPage ? 'active' : ''}">
                        <button class="page-link" onclick="changeInvestmentPage(${num})">${num}</button>
                    </li>
                `).join('')}
                <li class="page-item ${currentInvestmentPage === totalPages ? 'disabled' : ''}">
                    <button class="page-link" onclick="changeInvestmentPage(${currentInvestmentPage + 1})" ${currentInvestmentPage === totalPages ? 'disabled' : ''}>
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </li>
            </ul>
        `;
        paginationContainer.innerHTML = paginationHTML;
    }
}