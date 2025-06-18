document.addEventListener('DOMContentLoaded', () => {
    fetch('http://localhost:3000/quizzes')
        .then(response => response.json())
        .then(quizzes => {
            const listaQuizzes = document.getElementById('listaQuizzes');
            listaQuizzes.innerHTML = ''; // Limpa o conteúdo anterior

            quizzes.forEach(quiz => {
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
                    categoria.textContent = `Categoria: ${quiz.categoria}`;
                    cardBody.appendChild(categoria);
                }

                // Botão para acessar quiz (ajuste o link conforme necessário)
                const btn = document.createElement('a');
                btn.className = 'btn btn-primary';
                btn.textContent = 'Acessar Quiz';
                btn.href = `quiz.html?id=${quiz.id}`; // ajuste conforme sua rota
                cardBody.appendChild(btn);

                card.appendChild(cardBody);
                listaQuizzes.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Erro ao carregar quizzes:', error);
        });
});