const API_URL = 'http://localhost:3000';
let userModal;

async function loadUsers() {
    try {
        const response = await fetch(`${API_URL}/usuarios`);
        const users = await response.json();
        
        const filterType = document.getElementById('filterType').value;
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        
        const filteredUsers = users.filter(user => {
            const matchesFilter = filterType === 'all' || user.tipo === filterType;
            const matchesSearch = user.nome.toLowerCase().includes(searchTerm) || 
                                user.email.toLowerCase().includes(searchTerm);
            return matchesFilter && matchesSearch;
        });

        const tbody = document.getElementById('usersTable');
        tbody.innerHTML = filteredUsers.map(user => `
            <tr>
                <td>${user.nome}</td>
                <td>${user.email}</td>
                <td>${user.tipo === 'admin' ? 'Administrador' : 'Usuário'}</td>
                <td class="text-center">
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-info" onclick="viewUserDetails('${user.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-primary" onclick="editUser('${user.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteUser('${user.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
    }
}

function showAddUserModal() {
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
    document.getElementById('modalTitle').textContent = 'Adicionar Usuário';
    userModal = new bootstrap.Modal(document.getElementById('userModal'));
    userModal.show();
}

async function editUser(id) {
    try {
        const response = await fetch(`${API_URL}/usuarios/${id}`);
        const user = await response.json();
        
        document.getElementById('userId').value = user.id;
        document.getElementById('nome').value = user.nome;
        document.getElementById('email').value = user.email;
        document.getElementById('tipo').value = user.tipo;
        document.getElementById('modalTitle').textContent = 'Editar Usuário';
        
        // Limpar o campo de senha ao editar
        document.getElementById('senha').value = '';
        document.getElementById('senha').placeholder = 'Deixe em branco para manter a senha atual';
        
        userModal = new bootstrap.Modal(document.getElementById('userModal'));
        userModal.show();
    } catch (error) {
        console.error('Erro ao carregar usuário:', error);
    }
}

async function saveUser() {
    try {
        const userId = document.getElementById('userId').value;
        const nome = document.getElementById('nome').value.trim();
        const email = document.getElementById('email').value.trim();
        const senha = document.getElementById('senha').value;
        const tipo = document.getElementById('tipo').value;
        
        // Validação básica
        if (!nome || !email || (!userId && !senha)) {
            // Popup para campos obrigatórios
            Swal.fire({
                title: 'Campos obrigatórios',
                text: 'Nome, email e senha são obrigatórios.',
                icon: 'warning',
                confirmButtonText: 'OK',
                confirmButtonColor: '#ff7a00',
                background: '#111',
                color: '#fff',
                customClass: {
                    popup: 'swal-custom-popup',
                    confirmButton: 'swal-custom-button'
                }
            });
            return;
        }
        
        if (nome.length > 25) {
            alert('O nome deve ter no máximo 25 caracteres.');
            return;
        }
        
        // Verificar se o e-mail já existe (para novos usuários ou alteração de e-mail)
        const responseUsers = await fetch(`${API_URL}/usuarios`);
        const users = await responseUsers.json();
        
        // Verifica duplicidade de email
        const emailExists = users.some(user => {
            // Para novos usuários, verificar se o email já existe
            // Para edição, verificar se o email pertence a outro usuário
            return user.email === email && (!userId || user.id !== userId);
        });
        
        if (emailExists) {
            // Popup de email já em uso
            Swal.fire({
                title: 'Email já utilizado',
                text: 'Este email já está sendo utilizado por outro usuário.',
                icon: 'warning',
                confirmButtonText: 'OK',
                confirmButtonColor: '#ff7a00',
                background: '#111',
                color: '#fff',
                customClass: {
                    popup: 'swal-custom-popup',
                    confirmButton: 'swal-custom-button'
                }
            });
            return;
        }

        // Preparar dados
        const userData = {
            nome: nome,
            email: email,
            tipo: tipo
        };

        // Se for edição e senha estiver vazia, não a incluímos
        if (userId) {
            userData.id = userId;
            if (senha) {
                userData.senha = senha;
            } else {
                // Buscar a senha atual
                const response = await fetch(`${API_URL}/usuarios/${userId}`);
                const currentUser = await response.json();
                userData.senha = currentUser.senha;
            }
        } else {
            // Novo usuário
            userData.id = Date.now().toString();
            userData.senha = senha;
        }

        const method = userId ? 'PUT' : 'POST';
        const url = userId ? `${API_URL}/usuarios/${userId}` : `${API_URL}/usuarios`;

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            userModal.hide();
            loadUsers();
        } else {
            throw new Error('Erro ao salvar usuário');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao salvar usuário. Tente novamente.');
    }
}

async function deleteUser(id) {
    Swal.fire({
        title: 'Tem certeza?',
        text: "Esta ação não poderá ser revertida!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ff7a00',
        cancelButtonColor: '#333',
        confirmButtonText: 'Sim, excluir!',
        cancelButtonText: 'Cancelar',
        background: '#111',
        color: '#fff',
        customClass: {
            popup: 'swal-custom-popup',
            confirmButton: 'swal-custom-button',
            cancelButton: 'btn btn-dark'
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const response = await fetch(`${API_URL}/usuarios/${id}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    loadUsers();
                } else {
                    throw new Error('Erro ao excluir usuário');
                }
            } catch (error) {
                console.error('Erro:', error);
                alert('Não foi possível excluir o usuário.');
            }
        }
    });
}

async function viewUserDetails(userId) {
    try {
        const [user, allQuizzes, allEventos, registrations] = await Promise.all([
            fetch(`${API_URL}/usuarios/${userId}`).then(r => r.json()),
            fetch(`${API_URL}/quizzes`).then(r => r.json()),
            fetch(`${API_URL}/eventos`).then(r => r.json()),
            fetch(`${API_URL}/cadastroDeEventos`).then(r => r.json())
        ]);

        const userRegistrations = registrations.filter(reg => reg.idUsuario.includes(userId));

        // Render quizzes tab with collapsible responses
        document.getElementById('quizzesContent').innerHTML = user.idformulario && user.idformulario.length ? `
            <ul class="quiz-list">
                ${user.idformulario.map((quiz, index) => {
                    const quizInfo = allQuizzes.find(q => q.id === quiz.idQuiz);
                    return `
                        <li class="quiz-list-item">
                            <div class="quiz-header" onclick="toggleQuizAnswers('quiz-${index}')">
                                <div class="d-flex justify-content-between align-items-center">
                                    <h5 class="quiz-title text-orange mb-0">
                                        <i class="fas fa-clipboard-check me-2"></i>
                                        ${quizInfo ? quizInfo.titulo : 'Quiz não encontrado'}
                                    </h5>
                                    <span class="quiz-date text-muted">
                                        <i class="far fa-calendar-alt me-1"></i>
                                        ${new Date(quiz.dataRealizacao).toLocaleDateString('pt-BR')}
                                    </span>
                                </div>
                            </div>
                            <div class="quiz-answers" id="quiz-${index}">
                                ${quiz.questions.map((q, qIndex) => `
                                    <div class="response-item p-3">
                                        <strong class="d-block mb-1 text-orange">Pergunta ${qIndex + 1}:</strong>
                                        <p class="mb-2">${q.question}</p>
                                        <strong class="d-block mb-1 text-orange">Resposta:</strong>
                                        <p class="mb-0">${q.response}</p>
                                    </div>
                                `).join('')}
                            </div>
                        </li>
                    `;
                }).join('')}
            </ul>
        ` : '<p class="text-muted">Nenhum quiz realizado.</p>';

        // Render eventos tab
        document.getElementById('eventosContent').innerHTML = userRegistrations.length ? `
            <ul class="event-list">
                ${userRegistrations.map((registration, index) => {
                    const event = allEventos.find(e => e.id === registration.idEvento);
                    return `
                        <li class="event-list-item">
                            <div class="event-header" onclick="toggleEventDetails('event-${index}')">
                                <div class="d-flex justify-content-between align-items-center">
                                    <h5 class="event-title">
                                        <i class="fas fa-calendar-check me-2"></i>
                                        ${event ? event.titulo : 'Evento não encontrado'}
                                    </h5>
                                    <span class="event-date">
                                        <i class="far fa-calendar-alt me-1"></i>
                                        ${event ? new Date(event.data).toLocaleDateString('pt-BR') : 'Data não disponível'}
                                    </span>
                                </div>
                            </div>
                            <div class="event-details" id="event-${index}">
                                <div class="event-info">
                                    <p class="event-description">${event ? event.descricao : ''}</p>
                                    <div class="event-meta">
                                        <span class="badge bg-orange">${event ? event.categoria : ''}</span>
                                        <span class="event-location">
                                            <i class="fas fa-map-marker-alt me-1"></i>
                                            ${event ? event.local : ''}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </li>
                    `;
                }).join('')}
            </ul>
        ` : '<p class="text-muted">Nenhum evento inscrito.</p>';

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('userDetailsModal'));
        modal.show();
    } catch (error) {
        console.error('Erro ao carregar detalhes do usuário:', error);
        Swal.fire({
            title: 'Erro!',
            text: 'Não foi possível carregar os detalhes do usuário.',
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

// Add this function to handle quiz answers toggle
function toggleQuizAnswers(quizId) {
    const answersDiv = document.getElementById(quizId);
    answersDiv.classList.toggle('show');
}

// Add this function to handle event details toggle
function toggleEventDetails(eventId) {
    const detailsDiv = document.getElementById(eventId);
    detailsDiv.classList.toggle('show');
}

// Event Listeners
document.getElementById('searchInput').addEventListener('input', loadUsers);
document.getElementById('filterType').addEventListener('change', loadUsers);

// Função para pesquisar
function searchUsers() {
    loadUsers();
}