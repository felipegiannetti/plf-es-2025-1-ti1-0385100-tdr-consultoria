// Função para carregar as notícias do db.json
async function carregarNoticias() {
    try {
        const response = await fetch('http://localhost:3000/noticias');
        const noticias = await response.json();
        exibirNoticias(noticias);
    } catch (error) {
        console.error('Erro ao carregar notícias:', error);
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
                    <div class="card-img-top" style="background-color: #f8f9fa; height: 200px;"></div>
                    <div class="card-block">
                        <h5 class="card-title" style="font-family: 'Anton', sans-serif">${noticia.titulo}<hr></h5>
                        <p class="card-text">${noticia.descricao} <a href="#"><u>Ler mais...</u></a></p>
                        <p class="card-text">
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
}

// Carregar notícias quando a página for carregada
document.addEventListener('DOMContentLoaded', carregarNoticias);