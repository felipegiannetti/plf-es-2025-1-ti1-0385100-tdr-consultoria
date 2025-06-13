// URL base do JSON Server
const API_URL = 'http://localhost:3000';
// URL base do servidor de upload de imagens
const IMAGE_URL = 'http://localhost:4001';

// Ouve eventos personalizados (opcional)
window.addEventListener('noticiaAdicionada', function(event) {
    carregarNoticias(); // Recarrega todas as notícias
});

// Função principal para carregar as notícias
async function carregarNoticias() {
    try {
        const response = await fetch(`${API_URL}/noticias`);
        if (!response.ok) throw new Error('Erro ao carregar notícias');
        
        const noticias = await response.json();
        
        const container = document.getElementById('noticias-card');

        if (!noticias || noticias.length === 0) {
            container.innerHTML = `
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i> Nenhuma notícia disponível no momento.
                </div>
            `;
            return;
        }

        container.className = 'solution_cards_box';

        container.innerHTML = noticias.map(noticia => `
            <div class="solution_card">
                <div class="hover_color_bubble"></div>
                <div class="card-img-top" style="background-image: url('${IMAGE_URL}/${noticia.imagem}')"></div>
                <div class="solu_title">
                    <h3 class="card-title">${noticia.titulo}</h3>
                </div>
                <div class="solu_description">
                    <p class="card-text">${noticia.descricaoBreve}</p>
                    <div class="card-meta">
                        <span><i class="far fa-calendar"></i> ${new Date(noticia.data).toLocaleDateString('pt-BR')}</span>
                        <span><i class="far fa-user"></i> ${noticia.autor}</span>
                    </div>
                    <a href="noticia-detalhes.html?id=${noticia.id}" class="read_more_btn">Ler mais</a>
                </div>
            </div>
        `).join('');

        // Hover effect com jQuery, se necessário
        $('.card').on('mouseenter', function() {
            $(this).find('.card-text').slideDown(300);
        });

        $('.card').on('mouseleave', function() {
            $(this).find('.card-text').css({
                'display': 'none'
            });
        });

    } catch (error) {
        console.error('Erro:', error);
        document.getElementById('noticias-card').innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle"></i> Erro ao carregar notícias: ${error.message}
            </div>
        `;
    }
}

// Carregar automaticamente ao abrir a página
document.addEventListener('DOMContentLoaded', carregarNoticias);
