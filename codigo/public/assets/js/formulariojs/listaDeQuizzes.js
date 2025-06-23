document.addEventListener('DOMContentLoaded', () => {
    // Função para pegar parâmetros da URL
    function getUrlParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    // Pega o ID do usuário da URL atual
    const userId = getUrlParameter('idUsuario') || '1';

    fetch('http://localhost:3000/quizzes')
        .then(response => response.json())
        .then(quizzes => {
            const listaQuizzes = document.getElementById('listaQuizzes');
            listaQuizzes.innerHTML = ''; // Limpa o conteúdo anterior

            // Filtra apenas quizzes ativos
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

            quizzesAtivos.forEach(quiz => {
                const card = document.createElement('div');
                card.className = 'card mb-3';
                
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
                            <div class="d-flex align-items-center justify-content-between mb-3">
                                <span class="category-tag">
                                    <i class="fas fa-tag me-1"></i>${quiz.categoria || 'Geral'}
                                </span>
                            </div>
                            <a href="exibiformulario.html?idUsuario=${userId}&idQuiz=${quiz.id}" 
                               class="btn btn-primary w-100">
                                <i class="fas fa-play me-2"></i>Acessar Quiz
                            </a>
                        </div>
                    </div>
                `;
                
                listaQuizzes.appendChild(card);
            });
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