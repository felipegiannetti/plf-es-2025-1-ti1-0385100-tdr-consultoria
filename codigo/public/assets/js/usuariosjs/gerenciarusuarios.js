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
        // Fetch user details
        const user = await fetch(`${API_URL}/usuarios/${userId}`).then(r => r.json());
        
        // Fetch all quizzes to get titles
        const allQuizzes = await fetch(`${API_URL}/quizzes`).then(r => r.json());
        
        // Fetch all eventos
        const allEventos = await fetch(`${API_URL}/eventos`).then(r => r.json());
        
        // Fetch user's event registrations
        const registrations = await fetch(`${API_URL}/cadastroDeEventos`).then(r => r.json());
        const userRegistrations = registrations.filter(reg => reg.idUsuario.includes(userId));

        // Render quizzes tab with responses
        document.getElementById('quizzesContent').innerHTML = user.idformulario && user.idformulario.length ? `
            <div class="list-group">
                ${user.idformulario.map(quiz => {
                    const quizInfo = allQuizzes.find(q => q.id === quiz.idQuiz);
                    return `
                        <div class="list-group-item bg-dark text-white border-orange mb-3">
                            <h6 class="mb-1 text-orange">${quizInfo ? quizInfo.titulo : 'Quiz não encontrado'}</h6>
                            <p class="mb-1">Realizado em: ${new Date(quiz.dataRealizacao).toLocaleDateString('pt-BR')}</p>
                            <div class="mt-3">
                                <strong class="text-orange">Respostas:</strong>
                                <div class="ms-3 mt-2">
                                    ${quiz.questions.map((q, index) => `
                                        <div class="mb-3 p-3 rounded" style="background: rgba(255,255,255,0.1)">
                                            <strong class="text-orange">Pergunta ${index + 1}:</strong>
                                            <p class="mb-1 text-white">${q.question}</p>
                                            <strong class="text-orange">Resposta:</strong>
                                            <p class="mb-0 text-white">${q.response}</p>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        ` : '<p class="text-muted">Nenhum quiz realizado.</p>';

        // Render eventos tab
        document.getElementById('eventosContent').innerHTML = userRegistrations.length ? `
            <div class="list-group">
                ${userRegistrations.map(reg => {
                    const evento = allEventos.find(e => e.id === reg.idEvento);
                    return `
                        <div class="list-group-item bg-dark text-white border-orange mb-3">
                            <h6 class="mb-1 text-orange">${evento ? evento.titulo : 'Evento não encontrado'}</h6>
                            <p class="mb-1">Data do evento: ${evento ? new Date(evento.data).toLocaleDateString('pt-BR') : 'N/A'}</p>
                            <p class="mb-1">Local: ${evento ? evento.local : 'N/A'}</p>
                            <p class="mb-0">
                                <span class="badge bg-orange">
                                    ${evento ? evento.categoria : 'N/A'}
                                </span>
                            </p>
                        </div>
                    `;
                }).join('')}
            </div>
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

// Event Listeners
document.getElementById('searchInput').addEventListener('input', loadUsers);
document.getElementById('filterType').addEventListener('change', loadUsers);

// Função para pesquisar
function searchUsers() {
    loadUsers();
}