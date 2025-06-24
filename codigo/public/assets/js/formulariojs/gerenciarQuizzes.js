let quizzes = [];
let filteredQuizzes = [];
let editingQuizId = null;
let perguntaCounter = 0;

// Carrega todos os quizzes
async function loadQuizzes() {
    try {
        const response = await fetch('/quizzes');
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        quizzes = await response.json();
        filteredQuizzes = [...quizzes];
        displayQuizzes();
    } catch (error) {
        console.error('Erro ao carregar quizzes:', error);
        Swal.fire({
            title: 'Erro!',
            text: 'Não foi possível carregar os quizzes. Verifique se o servidor está rodando.',
            icon: 'error',
            background: '#222',
            color: '#fff',
            customClass: {
                popup: 'swal-custom-popup',
                confirmButton: 'swal-custom-button'
            }
        });
    }
}

// Exibe os quizzes na tabela
function displayQuizzes() {
    const tableBody = document.getElementById('quizzesTable');
    
    if (filteredQuizzes.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">Nenhum quiz encontrado</td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = filteredQuizzes.map(quiz => `
        <tr>
            <td>
                <strong>${quiz.titulo}</strong>
                <br>
                <small class="text-muted">${quiz.descricao_breve || 'Sem descrição'}</small>
            </td>
            <td>
                <span class="badge bg-info">${quiz.categoria || 'Sem categoria'}</span>
            </td>
            <td>
                <span class="badge bg-secondary">${quiz.perguntas ? quiz.perguntas.length : 0} perguntas</span>
            </td>
            <td>
                <span class="badge ${quiz.status === 'ativo' ? 'bg-success' : 'bg-danger'}">
                    ${quiz.status === 'ativo' ? 'Ativo' : 'Inativo'}
                </span>
            </td>
            <td class="text-center">
                <div class="btn-group" role="group">
                    <button class="btn btn-sm btn-outline-info" onclick="viewQuiz('${quiz.id}')" title="Visualizar">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning" onclick="editQuiz('${quiz.id}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteQuiz('${quiz.id}')" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Busca quizzes
function searchQuizzes() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filterCategory = document.getElementById('filterCategory').value;
    
    filteredQuizzes = quizzes.filter(quiz => {
        const matchesSearch = quiz.titulo.toLowerCase().includes(searchTerm) ||
                            (quiz.descricao_breve && quiz.descricao_breve.toLowerCase().includes(searchTerm));
        const matchesCategory = filterCategory === 'all' || quiz.categoria === filterCategory;
        
        return matchesSearch && matchesCategory;
    });
    
    displayQuizzes();
}

// Event listeners para filtros
document.getElementById('searchInput').addEventListener('input', searchQuizzes);
document.getElementById('filterCategory').addEventListener('change', searchQuizzes);

// Mostra modal para adicionar quiz
function showAddQuizModal() {
    editingQuizId = null;
    document.getElementById('modalTitle').textContent = 'Adicionar Quiz';
    document.getElementById('quizForm').reset();
    document.getElementById('quizId').value = '';
    document.getElementById('perguntasContainer').innerHTML = '';
    perguntaCounter = 0;
    addPergunta(); // Adiciona uma pergunta inicial
    
    const modal = new bootstrap.Modal(document.getElementById('quizModal'));
    modal.show();
}

// Adiciona uma pergunta
function addPergunta() {
    perguntaCounter++;
    const container = document.getElementById('perguntasContainer');
    const perguntaDiv = document.createElement('div');
    perguntaDiv.className = 'card mb-3';
    perguntaDiv.innerHTML = `
        <div class="card-header d-flex justify-content-between align-items-center">
            <h6 class="mb-0">Pergunta ${perguntaCounter}</h6>
            <button type="button" class="btn btn-sm btn-outline-danger" onclick="removePergunta(this)">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        <div class="card-body">
            <div class="mb-3">
                <label class="form-label">Texto da Pergunta</label>
                <input type="text" class="form-control pergunta-texto" required>
            </div>
            <div class="mb-3">
                <label class="form-label">Respostas</label>
                <div class="respostas-container">
                    <div class="input-group mb-2">
                        <input type="text" class="form-control resposta-texto" placeholder="Resposta 1" required>
                        <button type="button" class="btn btn-outline-secondary" onclick="addResposta(this)">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    container.appendChild(perguntaDiv);
}

// Remove uma pergunta
function removePergunta(button) {
    const perguntaDiv = button.closest('.card');
    perguntaDiv.remove();
}

// Adiciona uma resposta
function addResposta(button) {
    const container = button.closest('.respostas-container');
    const respostaCount = container.children.length + 1;
    
    const respostaDiv = document.createElement('div');
    respostaDiv.className = 'input-group mb-2';
    respostaDiv.innerHTML = `
        <input type="text" class="form-control resposta-texto" placeholder="Resposta ${respostaCount}" required>
        <button type="button" class="btn btn-outline-danger" onclick="removeResposta(this)">
            <i class="fas fa-minus"></i>
        </button>
    `;
    container.appendChild(respostaDiv);
}

// Remove uma resposta
function removeResposta(button) {
    const respostaDiv = button.closest('.input-group');
    respostaDiv.remove();
}

// Salva o quiz
async function saveQuiz() {
    const form = document.getElementById('quizForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // Coleta dados básicos do quiz
    const quizData = {
        titulo: document.getElementById('titulo').value,
        categoria: document.getElementById('categoria').value,
        descricao_breve: document.getElementById('descricao_breve').value,
        descricao: document.getElementById('descricao').value,
        imagem: document.getElementById('imagem').value,
        status: document.getElementById('status').value,
        perguntas: []
    };

    // Coleta perguntas
    const perguntasCards = document.querySelectorAll('.card');
    perguntasCards.forEach((card, index) => {
        const textoElement = card.querySelector('.pergunta-texto');
        if (textoElement) {
            const pergunta = {
                id: index + 1,
                texto: textoElement.value,
                respostas: []
            };

            const respostasInputs = card.querySelectorAll('.resposta-texto');
            respostasInputs.forEach((input, respIndex) => {
                if (input.value.trim()) {
                    pergunta.respostas.push({
                        id: respIndex + 1,
                        texto: input.value.trim()
                    });
                }
            });

            if (pergunta.respostas.length > 0) {
                quizData.perguntas.push(pergunta);
            }
        }
    });

    if (quizData.perguntas.length === 0) {
        Swal.fire({
            title: 'Atenção!',
            text: 'Adicione pelo menos uma pergunta com respostas.',
            icon: 'warning',
            background: '#222',
            color: '#fff',
            customClass: {
                popup: 'swal-custom-popup',
                confirmButton: 'swal-custom-button'
            }
        });
        return;
    }

    try {
        let response;
        if (editingQuizId) {
            response = await fetch(`/quizzes/${editingQuizId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...quizData, id: editingQuizId })
            });
        } else {
            quizData.id = Date.now().toString();
            response = await fetch('/quizzes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(quizData)
            });
        }

        if (response.ok) {
            // Just close modal and reload quizzes without showing success alert
            bootstrap.Modal.getInstance(document.getElementById('quizModal')).hide();
            loadQuizzes();
        } else {
            throw new Error('Erro ao salvar quiz');
        }
    } catch (error) {
        console.error('Erro ao salvar quiz:', error);
        Swal.fire({
            title: 'Erro!',
            text: 'Não foi possível salvar o quiz.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

// Visualiza detalhes do quiz
function viewQuiz(id) {
    const quiz = quizzes.find(q => q.id === id);
    if (!quiz) return;

    const detailsHtml = `
        <div class="row">
            <div class="col-md-6">
                <h5>${quiz.titulo}</h5>
                <p><strong>Categoria:</strong> ${quiz.categoria || 'Não definida'}</p>
                <p><strong>Status:</strong> 
                    <span class="badge ${quiz.status === 'ativo' ? 'bg-success' : 'bg-danger'}">
                        ${quiz.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </span>
                </p>
            </div>
            <div class="col-md-6">
                ${quiz.imagem ? `<img src="${quiz.imagem}" alt="Quiz Image" class="img-fluid rounded" style="max-height: 200px;">` : ''}
            </div>
        </div>
        <div class="mt-3">
            <p><strong>Descrição:</strong></p>
            <p>${quiz.descricao || quiz.descricao_breve || 'Sem descrição'}</p>
        </div>
        <div class="mt-3">
            <h6>Perguntas (${quiz.perguntas ? quiz.perguntas.length : 0}):</h6>
            ${quiz.perguntas ? quiz.perguntas.map((pergunta, index) => `
                <div class="card mb-2">
                    <div class="card-body">
                        <h6>${index + 1}. ${pergunta.texto}</h6>
                        <ul class="list-unstyled ms-3">
                            ${pergunta.respostas.map(resposta => `
                                <li>• ${resposta.texto}</li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            `).join('') : '<p>Nenhuma pergunta cadastrada.</p>'}
        </div>
    `;

    document.getElementById('quizDetails').innerHTML = detailsHtml;
    const modal = new bootstrap.Modal(document.getElementById('viewQuizModal'));
    modal.show();
}

// Edita um quiz
function editQuiz(id) {
    const quiz = quizzes.find(q => q.id === id);
    if (!quiz) return;

    editingQuizId = id;
    document.getElementById('modalTitle').textContent = 'Editar Quiz';
    
    // Preenche dados básicos
    document.getElementById('quizId').value = quiz.id;
    document.getElementById('titulo').value = quiz.titulo;
    document.getElementById('categoria').value = quiz.categoria || '';
    document.getElementById('descricao_breve').value = quiz.descricao_breve || '';
    document.getElementById('descricao').value = quiz.descricao || '';
    document.getElementById('imagem').value = quiz.imagem || '';
    document.getElementById('status').value = quiz.status || 'ativo';

    // Limpa container de perguntas
    document.getElementById('perguntasContainer').innerHTML = '';
    perguntaCounter = 0;

    // Adiciona perguntas existentes
    if (quiz.perguntas && quiz.perguntas.length > 0) {
        quiz.perguntas.forEach(pergunta => {
            addPergunta();
            const lastCard = document.querySelector('.card:last-child');
            lastCard.querySelector('.pergunta-texto').value = pergunta.texto;
            
            const respostasContainer = lastCard.querySelector('.respostas-container');
            respostasContainer.innerHTML = ''; // Limpa resposta padrão
            
            pergunta.respostas.forEach(resposta => {
                const respostaDiv = document.createElement('div');
                respostaDiv.className = 'input-group mb-2';
                respostaDiv.innerHTML = `
                    <input type="text" class="form-control resposta-texto" value="${resposta.texto}" required>
                    <button type="button" class="btn btn-outline-danger" onclick="removeResposta(this)">
                        <i class="fas fa-minus"></i>
                    </button>
                `;
                respostasContainer.appendChild(respostaDiv);
            });
        });
    } else {
        addPergunta(); // Adiciona uma pergunta vazia se não houver nenhuma
    }

    const modal = new bootstrap.Modal(document.getElementById('quizModal'));
    modal.show();
}

// Exclui um quiz
async function deleteQuiz(id) {
    const quiz = quizzes.find(q => q.id === id);
    if (!quiz) return;

    const result = await Swal.fire({
        title: 'Tem certeza?',
        text: `Deseja excluir o quiz "${quiz.titulo}"?`,
        icon: 'warning',
        background: '#222',
        color: '#fff',
        showCancelButton: true,
        confirmButtonText: 'Sim, excluir!',
        cancelButtonText: 'Cancelar',
        customClass: {
            popup: 'swal-custom-popup',
            confirmButton: 'swal-custom-button',
            cancelButton: 'swal-custom-button'
        }
    });

    if (result.isConfirmed) {
        try {
            const response = await fetch(`/quizzes/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                Swal.fire({
                    title: 'Excluído!',
                    text: 'Quiz excluído com sucesso.',
                    icon: 'success',
                    background: '#222',
                    color: '#fff',
                    timer: 2000,
                    timerProgressBar: true,
                    customClass: {
                        popup: 'swal-custom-popup',
                        confirmButton: 'swal-custom-button',
                        timerProgressBar: 'swal-timer-progress'
                    }
                });
                loadQuizzes();
            } else {
                throw new Error('Erro ao excluir quiz');
            }
        } catch (error) {
            console.error('Erro ao excluir quiz:', error);
            Swal.fire({
                title: 'Erro!',
                text: 'Não foi possível excluir o quiz.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    }
}