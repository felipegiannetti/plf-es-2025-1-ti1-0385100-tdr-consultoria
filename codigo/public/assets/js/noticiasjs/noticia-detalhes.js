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
                <p class="noticias-descricaobreve">${noticiaAtual.descricao_breve || ''}</p>
                <div class="noticia-meta">
                    <span><i class="far fa-calendar"></i> ${new Date(noticiaAtual.data).toLocaleDateString('pt-BR')}</span>
                    <span><i class="far fa-user"></i> ${noticiaAtual.autor || 'Anônimo'}</span>
                </div>
                <img src="http://localhost:3000/${noticiaAtual.imagem}" alt="${noticiaAtual.titulo}" class="noticia-imagem">

                <hr>

                <div class="noticia-texto">
                    <div class="texto-completo">
                        ${noticiaAtual.texto_completo || ''}
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

document.addEventListener('DOMContentLoaded', function() {
    carregarNoticia();
    if (typeof checkAdminAccess === 'function') checkAdminAccess();
});
