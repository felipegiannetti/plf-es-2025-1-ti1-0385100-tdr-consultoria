const API_URL = 'http://localhost:3000';

// Load news when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadNews();
    document.getElementById('form-cadastro').addEventListener('submit', handleSubmit);
});

async function loadNews() {
    try {
        const response = await fetch(`${API_URL}/noticias`);
        const noticias = await response.json();
        
        const tableBody = document.getElementById('newsTable');
        tableBody.innerHTML = noticias.map(noticia => `
            <tr>
                <td>${noticia.titulo}</td>
                <td>${noticia.categoria}</td>
                <td>${noticia.autor || 'Anônimo'}</td>
                <td class="text-center">
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-primary" onclick="editNews('${noticia.id}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger ms-2" onclick="deleteNews('${noticia.id}')" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Erro ao carregar notícias:', error);
    }
}

async function handleSubmit(event) {
    event.preventDefault();
    
    try {
        const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
        if (!usuario) {
            throw new Error('Usuário não está logado');
        }
        
        const noticiaData = {
            id: document.getElementById('noticiaId').value || Date.now().toString(),
            titulo: document.getElementById('titulo').value,
            descricao_breve: document.getElementById('descricao_breve').value,
            texto_completo: document.getElementById('texto_completo').value,
            categoria: document.getElementById('categoria').value,
            imagem: document.getElementById('imagem').value || '',
            data: new Date().toISOString(),
            autor: usuario.nome,
            autorId: usuario.id
        };

        const isEditing = document.getElementById('noticiaId').value !== '';
        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing ? 
            `${API_URL}/noticias/${noticiaData.id}` : 
            `${API_URL}/noticias`;

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(noticiaData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        alert('Notícia salva com sucesso!');
        document.getElementById('form-cadastro').reset();
        document.getElementById('noticiaId').value = '';
        loadNews();
        
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao salvar notícia: ' + error.message);
    }
}

async function editNews(id) {
    try {
        const response = await fetch(`${API_URL}/noticias/${id}`);
        const noticia = await response.json();
        
        document.getElementById('noticiaId').value = noticia.id;
        document.getElementById('titulo').value = noticia.titulo;
        document.getElementById('descricao_breve').value = noticia.descricao_breve;
        document.getElementById('texto_completo').value = noticia.texto_completo;
        document.getElementById('categoria').value = noticia.categoria;
        document.getElementById('imagem').value = noticia.imagem || '';
        
        if (noticia.imagem) {
            mostrarImagemAtual(noticia.imagem);
        }
    } catch (error) {
        console.error('Erro ao carregar notícia:', error);
        alert('Erro ao carregar notícia para edição');
    }
}

async function deleteNews(id) {
    if (confirm('Tem certeza que deseja excluir esta notícia?')) {
        try {
            const response = await fetch(`${API_URL}/noticias/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('Notícia excluída com sucesso!');
                loadNews();
            } else {
                throw new Error('Erro ao excluir notícia');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao excluir notícia: ' + error.message);
        }
    }
}

function mostrarImagemAtual(url) {
    const info = document.getElementById('imagem-info');
    if (url) {
        const nomeArquivo = url.split('/').pop();
        info.textContent = `Arquivo atual: ${nomeArquivo}`;
        info.style.display = 'block';
    } else {
        info.textContent = '';
        info.style.display = 'none';
    }
}