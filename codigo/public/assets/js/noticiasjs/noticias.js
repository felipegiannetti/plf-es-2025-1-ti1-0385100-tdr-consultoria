// URL base do JSON Server
const API_URL = 'http://localhost:3000';

// Função para carregar as notícias do db.json
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
        
        // Salvar as notícias no localStorage
        localStorage.setItem('noticias', JSON.stringify(noticias));
        
        // Exibir as notícias usando a função correta
        const container = document.getElementById('noticias-card');
        container.innerHTML = '';

        noticias.forEach(noticia => {
            const card = document.createElement('div');
            card.className = 'news-card';
            card.innerHTML = `
                <a href="noticia-detalhes.html?id=${noticia.id}" class="text-decoration-none">
                    <div class="news-image">
                        <img src="${noticia.imagem}" alt="${noticia.titulo}">
                    </div>
                    <div class="news-content">
                        <h3>${noticia.titulo}</h3>
                        <p class="news-preview">${noticia.descricao.substring(0, 150)}...</p>
                        <div class="news-meta">
                            <span class="news-date">${new Date(noticia.data).toLocaleDateString()}</span>
                            <span class="news-author">Por ${noticia.autor}</span>
                        </div>
                    </div>
                </a>
            `;
            container.appendChild(card);
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

// Function to create news cards
function criarCards() {
    const container = document.getElementById('noticias-card');
    let htmlContent = '<div class="card-group">';

    forEach(noticia => {
        htmlContent += `
            <div class="underlay">
                <div class="card">
                    <div class="card-img-top" style="background-image: url('${noticia.imagem}')"></div>
                    <div class="card-block">
                        <h5 class="card-title" style="font-family: 'Anton', sans-serif">${noticia.titulo}<hr></h5>
                        <p class="card-text">${noticia.descricao} <a href="#"><u>Ler mais...</u></a></p>
                        <p class="card-text"><small class="text-muted">Publicado em ${noticia.data}</small></p>
                    </div>
                </div>
            </div>
        `;
    });

    htmlContent += '</div>';
    container.innerHTML = htmlContent;

    // Add hover effects
    $('.card').on('mouseenter', function() {
        $(this).find('.card-text').slideDown(300);
    });

    $('.card').on('mouseleave', function() {
        $(this).find('.card-text').css({
            'display': 'none'
        });
    });
}

function exibirNoticias() {
    const noticias = JSON.parse(localStorage.getItem('noticias')) || [];
    const container = document.getElementById('noticias-card');
    container.innerHTML = '';

    noticias.forEach(noticia => {
        const card = document.createElement('div');
        card.className = 'news-card';
        card.innerHTML = `
            <a href="noticia-detalhes.html?id=${noticia.id}" class="text-decoration-none">
                <div class="news-image">
                    <img src="${noticia.imagem}" alt="${noticia.titulo}">
                </div>
                <div class="news-content">
                    <h3>${noticia.titulo}</h3>
                    <p class="news-preview">${noticia.descricao.substring(0, 150)}...</p>
                    <div class="news-meta">
                        <span class="news-date">${new Date(noticia.data).toLocaleDateString()}</span>
                        <span class="news-author">Por ${noticia.autor}</span>
                    </div>
                </div>
            </a>
        `;
        container.appendChild(card);
    });
}

