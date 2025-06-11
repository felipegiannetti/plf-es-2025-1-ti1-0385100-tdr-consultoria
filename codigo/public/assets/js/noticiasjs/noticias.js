// URL base do JSON Server
const API_URL = 'http://localhost:3000';

// Listen for new articles
window.addEventListener('noticiaAdicionada', function(event) {
    carregarNoticias(); // Reload all news when a new article is added
});

// Modify the carregarNoticias function to sort by date
async function carregarNoticias() {
    try {
        const response = await fetch(`${API_URL}/noticias`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const noticias = await response.json();
        
        if (noticias.length === 0) {
            document.getElementById('noticias-card').innerHTML = `
                <div class="alert alert-info">
                    Nenhuma notícia disponível no momento.
                </div>
            `;
            return;
        }
        
        // Sort news by date (newest first)
        noticias.sort((a, b) => new Date(b.data) - new Date(a.data));
        
        localStorage.setItem('noticias', JSON.stringify(noticias));
        
        const container = document.getElementById('noticias-card');
        let htmlContent = '<div class="card-group">';

        noticias.forEach(noticia => {
            htmlContent += `
                <div class="underlay animate__animated animate__fadeIn">
                    <a href="noticia-detalhes.html?id=${noticia.id}" class="text-decoration-none">
                        <div class="card">
                            <div class="card-img-top" style="background-image: url('${noticia.imagem}')"></div>
                            <div class="card-block">
                                <h5 class="card-title" style="font-family: 'Anton', sans-serif">${noticia.titulo}<hr></h5>
                                <p class="card-text">${noticia.descricao.substring(0, 150)}... <u>Ler mais...</u></p>
                                <div class="card-meta">
                                    <p class="card-text">
                                        <small class="text-muted">Publicado em ${new Date(noticia.data).toLocaleDateString()}</small>
                                        <small class="text-muted ms-2">Por ${noticia.autor}</small>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </a>
                </div>
            `;
        });

        htmlContent += '</div>';
        container.innerHTML = htmlContent;

        // Re-add hover effects
        $('.card').on('mouseenter', function() {
            $(this).find('.card-text').slideDown(300);
        });

        $('.card').on('mouseleave', function() {
            $(this).find('.card-text').css({
                'display': 'none'
            });
        });

    } catch (error) {
        console.error('Erro ao carregar notícias:', error);
        document.getElementById('noticias-card').innerHTML = `
            <div class="alert alert-danger">
                Erro ao carregar notícias. Por favor, tente novamente mais tarde.<br>
                Erro: ${error.message}
            </div>
        `;
    }
}

// Carregar notícias quando a página for carregada
document.addEventListener('DOMContentLoaded', carregarNoticias);

