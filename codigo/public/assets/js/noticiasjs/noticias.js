// URL base do JSON Server
const API_URL = '';
// URL base do servidor de upload de imagens
const IMAGE_URL = '';
const NOTICIAS_PER_PAGE = 6;
let currentPage = 1;

// Ouve eventos personalizados (opcional)
window.addEventListener('noticiaAdicionada', function(event) {
    carregarNoticias(); // Recarrega todas as notícias
});

// Função principal para carregar as notícias
async function carregarNoticias(page = 1) {
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

        // Calculate pagination
        const totalPages = Math.ceil(noticias.length / NOTICIAS_PER_PAGE);
        const startIndex = (page - 1) * NOTICIAS_PER_PAGE;
        const endIndex = startIndex + NOTICIAS_PER_PAGE;
        const currentNoticias = noticias.slice(startIndex, endIndex);

        container.className = 'solution_cards_box';

        // Render news cards
        container.innerHTML = `
            <div class="news-grid">
                ${currentNoticias.map(noticia => `
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
                `).join('')}
            </div>
            ${totalPages > 1 ? `
                <div class="pagination-container">
                    <ul class="pagination">
                        <li class="page-item ${page === 1 ? 'disabled' : ''}">
                            <button class="page-link" onclick="changePage(${page - 1})" ${page === 1 ? 'disabled' : ''}>
                                <i class="fas fa-chevron-left"></i>
                            </button>
                        </li>
                        ${Array.from({length: totalPages}, (_, i) => i + 1).map(num => `
                            <li class="page-item ${num === page ? 'active' : ''}">
                                <button class="page-link" onclick="changePage(${num})">${num}</button>
                            </li>
                        `).join('')}
                        <li class="page-item ${page === totalPages ? 'disabled' : ''}">
                            <button class="page-link" onclick="changePage(${page + 1})" ${page === totalPages ? 'disabled' : ''}>
                                <i class="fas fa-chevron-right"></i>
                            </button>
                        </li>
                    </ul>
                </div>
            ` : ''}
        `;

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

function changePage(newPage) {
    currentPage = newPage;
    carregarNoticias(currentPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Initialize with first page
document.addEventListener('DOMContentLoaded', () => carregarNoticias(1));
