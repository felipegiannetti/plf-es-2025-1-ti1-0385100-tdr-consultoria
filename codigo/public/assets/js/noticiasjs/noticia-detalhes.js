const API_URL = 'http://localhost:3000';
let noticiaAtual = null;

async function carregarNoticia() {
    const urlParams = new URLSearchParams(window.location.search);
    const noticiaId = urlParams.get('id');

    try {
        const response = await fetch(`${API_URL}/noticias/${noticiaId}`);
        if (!response.ok) throw new Error('Notícia não encontrada');
        
        noticiaAtual = await response.json();
        
        document.getElementById('noticia-detalhada').innerHTML = `
            <article class="noticia-content">
                <h1 class="noticia-titulo">${noticiaAtual.titulo}</h1>
                <div class="noticia-meta">
                    <span><i class="far fa-calendar"></i> ${new Date(noticiaAtual.data).toLocaleDateString('pt-BR')}</span>
                    <span><i class="far fa-user"></i> ${noticiaAtual.autor}</span>
                </div>
                <img src="http://localhost:4001/${noticiaAtual.imagem}" alt="${noticiaAtual.titulo}" class="noticia-imagem">
                <div class="noticia-texto">
                    <p>${noticiaAtual.descricaoBreve}</p>
                    <div class="texto-completo">
                        ${noticiaAtual.textoCompleto}
                    </div>
                </div>
            </article>
        `;
    } catch (error) {
        console.error('Erro:', error);
        document.getElementById('noticia-detalhada').innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle"></i> ${error.message}
            </div>
        `;
    }
}

async function excluirNoticia() {
    if (!confirm('Tem certeza que deseja excluir esta notícia?')) return;

    const urlParams = new URLSearchParams(window.location.search);
    const noticiaId = urlParams.get('id');

    try {
        const response = await fetch(`${API_URL}/noticias/${noticiaId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Erro ao excluir notícia');

        alert('Notícia excluída com sucesso!');
        window.location.href = 'noticias.html';

    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao excluir notícia: ' + error.message);
    }
}

function editarNoticia() {
    if (!noticiaAtual) return;
    
    // Store the current news data
    localStorage.setItem('editando_noticia', JSON.stringify(noticiaAtual));
    // Redirect to edit page
    window.location.href = `editar-noticia.html?id=${noticiaAtual.id}`;
}

document.addEventListener('DOMContentLoaded', function() {
    carregarNoticia();
    checkAdminAccess(); // Make sure only admins can see edit/delete buttons
});
