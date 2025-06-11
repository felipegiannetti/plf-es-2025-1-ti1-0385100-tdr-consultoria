document.addEventListener('DOMContentLoaded', function() {
    // Obter o ID da notícia da URL
    const urlParams = new URLSearchParams(window.location.search);
    const noticiaId = urlParams.get('id');

    if (noticiaId) {
        // Recuperar notícias do localStorage
        const noticias = JSON.parse(localStorage.getItem('noticias')) || [];
        
        // Encontrar a notícia específica
        const noticia = noticias.find(n => n.id === noticiaId);

        if (noticia) {
            // Exibir os detalhes da notícia
            const noticiaDetalhada = document.getElementById('noticia-detalhada');
            noticiaDetalhada.innerHTML = `
                <h1 class="mb-4">${noticia.titulo}</h1>
                <div class="mb-3">
                    <img src="${noticia.imagem}" alt="${noticia.titulo}" class="img-fluid mb-3">
                </div>
                <div class="meta-info mb-3">
                    <span class="text-muted">Data: ${new Date(noticia.data).toLocaleDateString()}</span>
                    <span class="text-muted ms-3">Autor: ${noticia.autor}</span>
                </div>
                <div class="noticia-conteudo">
                    ${noticia.descricao}
                </div>
            `;
        }
    }
});