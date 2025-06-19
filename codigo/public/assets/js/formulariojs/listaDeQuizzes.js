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
                // Cria o card
                const card = document.createElement('div');
                card.className = 'card mb-3';

                // Imagem do quiz (se houver)
                if (quiz.imagem) {
                    const img = document.createElement('img');
                    img.src = quiz.imagem;
                    img.className = 'card-img-top';
                    img.alt = quiz.titulo;
                    card.appendChild(img);
                }

                // Corpo do card
                const cardBody = document.createElement('div');
                cardBody.className = 'card-body';

                // Título
                const titulo = document.createElement('h5');
                titulo.className = 'card-title';
                titulo.textContent = quiz.titulo;
                cardBody.appendChild(titulo);

                // Descrição breve
                if (quiz.descricao_breve) {
                    const desc = document.createElement('p');
                    desc.className = 'card-text';
                    desc.textContent = quiz.descricao_breve;
                    cardBody.appendChild(desc);
                }

                // Categoria
                if (quiz.categoria) {
                    const categoria = document.createElement('p');
                    categoria.className = 'card-text';
                    categoria.innerHTML = `<span class="badge bg-info">${quiz.categoria}</span>`;
                    cardBody.appendChild(categoria);
                }

                // Número de perguntas (se disponível)
                if (quiz.perguntas && quiz.perguntas.length > 0) {
                    const perguntas = document.createElement('p');
                    perguntas.className = 'card-text';
                    perguntas.innerHTML = `<small class="text-muted"><i class="fas fa-question-circle me-1"></i>${quiz.perguntas.length} pergunta${quiz.perguntas.length > 1 ? 's' : ''}</small>`;
                    cardBody.appendChild(perguntas);
                }

                // Botão para acessar quiz - MODIFICADO para passar userId e quizId
                const btn = document.createElement('a');
                btn.className = 'btn btn-primary';
                btn.innerHTML = '<i class="fas fa-play me-2"></i>Acessar Quiz';
                btn.href = `exibiformulario.html?idUsuario=${userId}&idQuiz=${quiz.id}`;
                cardBody.appendChild(btn);

                card.appendChild(cardBody);
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