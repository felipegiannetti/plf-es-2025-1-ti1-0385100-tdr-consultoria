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
        
        exibirNoticias(noticias);
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

// Função para exibir as notícias no HTML
function exibirNoticias(noticias) {
    const container = document.getElementById('noticias-card');
    let htmlContent = '<div class="card-group">';

    noticias.forEach(noticia => {
        htmlContent += `
            <div class="underlay">
                <div class="card">
                    <div class="card-img-top" style="background-image: url('${noticia.imagem}')"></div>
                    <div class="card-block">
                        <h5 class="card-title" style="font-family: 'Anton', sans-serif">
                            ${noticia.titulo}
                        </h5>
                        <p class="card-text description">${noticia.descricao}</p>
                        <p class="card-text expanded-text" style="display: none;">${noticia.texto_completo}</p>
                        <p class="card-text mt-2">
                            <small class="text-muted">
                                Publicado em ${noticia.data} às ${noticia.hora}
                            </small>
                        </p>
                    </div>
                </div>
            </div>
        `;
    });

    htmlContent += '</div>';
    container.innerHTML = htmlContent;

    // Efeitos de hover
    $('.card').on('mouseenter', function() {
        $(this).find('.description').slideUp(300);
        $(this).find('.expanded-text').slideDown(300);
    }).on('mouseleave', function() {
        $(this).find('.expanded-text').slideUp(300);
        $(this).find('.description').slideDown(300);
    });
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

