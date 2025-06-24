document.addEventListener('DOMContentLoaded', () => {
    const QUIZZES_PER_PAGE = 6;
    let currentPage = parseInt(getUrlParameter('page')) || 1;
    let totalPages = 0;

    // Função para pegar parâmetros da URL
    function getUrlParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    // Pega o ID do usuário da URL atual
    const userId = getUrlParameter('idUsuario') || '1';

    function renderQuizzes(quizzesAtivos) {
        const listaQuizzes = document.getElementById('listaQuizzes');
        listaQuizzes.innerHTML = '';

        // Create container for all content
        const contentContainer = document.createElement('div');
        contentContainer.className = 'content-wrapper d-flex flex-column min-vh-100';
        
        // Create container specifically for cards with grid
        const cardsGrid = document.createElement('div');
        cardsGrid.className = 'cards-grid row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 flex-grow-1';
        
        const startIndex = (currentPage - 1) * QUIZZES_PER_PAGE;
        const endIndex = startIndex + QUIZZES_PER_PAGE;
        const currentQuizzes = quizzesAtivos.slice(startIndex, endIndex);

        // Render quiz cards
        currentQuizzes.forEach(quiz => {
            const cardCol = document.createElement('div');
            cardCol.className = 'col';
            
            const card = document.createElement('div');
            card.className = 'card h-100';
            
            // Card HTML structure
            card.innerHTML = `
                <img src="${quiz.imagem}" class="card-img-top" alt="${quiz.titulo}">
                <div class="card-body">
                    <div class="card-content">
                        <h5 class="card-title">${quiz.titulo}</h5>
                        ${quiz.descricao_breve ? `
                            <p class="card-text mb-3">${quiz.descricao_breve}</p>
                        ` : ''}
                        ${quiz.perguntas ? `
                            <p class="card-text mb-3">
                                <small class="text-muted">
                                    <i class="fas fa-question-circle me-1"></i>
                                    ${quiz.perguntas.length} pergunta${quiz.perguntas.length > 1 ? 's' : ''}
                                </small>
                            </p>
                        ` : ''}
                    </div>
                    <div class="card-footer border-0 bg-transparent">
                        <a href="exibiformulario.html?idUsuario=${userId}&idQuiz=${quiz.id}" 
                           class="btn btn-primary w-100">
                            <i class="fas fa-play me-2"></i>Acessar Quiz
                        </a>
                    </div>
                </div>
            `;
            
            cardCol.appendChild(card);
            cardsGrid.appendChild(cardCol);
        });

        contentContainer.appendChild(cardsGrid);

        // Add pagination in a separate container
        if (quizzesAtivos.length > QUIZZES_PER_PAGE) {
            const paginationContainer = document.createElement('div');
            paginationContainer.className = 'pagination-container w-100 d-flex justify-content-center mt-5 mb-4';
            
            const pagination = document.createElement('ul');
            pagination.className = 'pagination';

            pagination.innerHTML = `
                <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                    <button class="page-link" data-page="${currentPage - 1}">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                </li>
            `;

            for (let i = 1; i <= totalPages; i++) {
                pagination.innerHTML += `
                    <li class="page-item ${currentPage === i ? 'active' : ''}">
                        <button class="page-link" data-page="${i}">${i}</button>
                    </li>
                `;
            }

            pagination.innerHTML += `
                <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                    <button class="page-link" data-page="${currentPage + 1}">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </li>
            `;

            paginationContainer.appendChild(pagination);
            contentContainer.appendChild(paginationContainer);

            // Add click handler for pagination
            pagination.addEventListener('click', (e) => {
                const button = e.target.closest('.page-link');
                if (button) {
                    e.preventDefault();
                    const newPage = parseInt(button.dataset.page);
                    if (newPage >= 1 && newPage <= totalPages) {
                        currentPage = newPage;
                        renderQuizzes(quizzesAtivos);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                }
            });
        }

        listaQuizzes.appendChild(contentContainer);
    }

    fetch('/quizzes')
        .then(response => response.json())
        .then(quizzes => {
            const quizzesAtivos = quizzes.filter(quiz => quiz.status === 'ativo');
            
            if (quizzesAtivos.length === 0) {
                // Mostra mensagem se não houver quizzes ativos
                const mensagem = document.createElement('div');
                mensagem.className = 'container my-5';
                mensagem.innerHTML = `
                    <div class="card">
                        <div class="card-body text-center">
                            <div class="mb-4">
                                <i class="fas fa-info-circle text-info" style="font-size: 3rem;"></i>
                            </div>
                            <h3>Nenhum quiz disponível</h3>
                            <p class="text-muted">No momento não há quizzes ativos para participar.</p>
                            <p class="text-muted">Volte em breve para conferir novos quizzes!</p>
                            <div class="mt-4">
                                <a href="../../../index.html?idUsuario=${userId}" class="btn btn-primary">
                                    <i class="fas fa-home me-2"></i>Voltar para Home
                                </a>
                            </div>
                        </div>
                    </div>
                `;
                listaQuizzes.appendChild(mensagem);
                return;
            }

            totalPages = Math.ceil(quizzesAtivos.length / QUIZZES_PER_PAGE);
            renderQuizzes(quizzesAtivos);
        })
        .catch(error => {
            console.error('Erro ao carregar quizzes:', error);
            
            // Mostra mensagem de erro
            const listaQuizzes = document.getElementById('listaQuizzes');
            listaQuizzes.innerHTML = `
                <div class="container my-5">
                    <div class="card">
                        <div class="card-body text-center">
                            <div class="mb-4">
                                <i class="fas fa-exclamation-triangle text-warning" style="font-size: 3rem;"></i>
                            </div>
                            <h3>Erro ao carregar quizzes</h3>
                            <p class="text-muted">Não foi possível conectar ao servidor.</p>
                            <p class="text-muted">Verifique se o json-server está rodando.</p>
                            <div class="mt-4">
                                <button class="btn btn-primary me-2" onclick="location.reload()">
                                    <i class="fas fa-redo me-2"></i>Tentar Novamente
                                </button>
                                <a href="../../../index.html?idUsuario=${userId}" class="btn btn-secondary">
                                    <i class="fas fa-home me-2"></i>Voltar para Home
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
});