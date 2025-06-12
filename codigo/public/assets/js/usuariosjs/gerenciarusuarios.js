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
        
        userModal = new bootstrap.Modal(document.getElementById('userModal'));
        userModal.show();
    } catch (error) {
        console.error('Erro ao carregar usuário:', error);
    }
}

async function saveUser() {
    try {
        const userId = document.getElementById('userId').value;
        const userData = {
            nome: document.getElementById('nome').value,
            email: document.getElementById('email').value,
            senha: document.getElementById('senha').value,
            tipo: document.getElementById('tipo').value
        };

        const method = userId ? 'PUT' : 'POST';
        const url = userId ? `${API_URL}/usuarios/${userId}` : `${API_URL}/usuarios`;

        if (userId) {
            userData.id = userId;
        } else {
            userData.id = Date.now().toString();
        }

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
            alert('Usuário salvo com sucesso!');
        } else {
            throw new Error('Erro ao salvar usuário');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao salvar usuário');
    }
}

async function deleteUser(id) {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
        try {
            const response = await fetch(`${API_URL}/usuarios/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                loadUsers();
                alert('Usuário excluído com sucesso!');
            } else {
                throw new Error('Erro ao excluir usuário');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao excluir usuário');
        }
    }
}

// Event Listeners
document.getElementById('searchInput').addEventListener('input', loadUsers);
document.getElementById('filterType').addEventListener('change', loadUsers);