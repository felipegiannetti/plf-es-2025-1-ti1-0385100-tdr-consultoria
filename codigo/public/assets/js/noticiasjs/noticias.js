// Função para carregar as notícias do db.json
async function carregarNoticias() {
    try {
        const response = await fetch('http://localhost:3000/noticias');
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
    console.log('Notícias recebidas:', noticias); // Debug log
    
    const container = document.getElementById('noticias-card');
    let htmlContent = '<div class="card-group">';

    noticias.forEach(noticia => {
        console.log('Processando notícia:', noticia); // Debug log
        htmlContent += `
            <div class="underlay">
                <div class="card">
                    <img src="${noticia.imagem}" class="card-img-top" alt="${noticia.titulo}" 
                         onerror="this.src='../../assets/images/placeholder.jpg'">
                    <div class="card-body"> <!-- Changed from card-block to card-body -->
                        <h5 class="card-title" style="font-family: 'Anton', sans-serif">
                            ${noticia.titulo || 'Sem título'}
                        </h5>
                        <hr>
                        <p class="card-text">${noticia.descricao || 'Sem descrição'}</p>
                        <a href="#" class="text-primary"><u>Ler mais...</u></a>
                        <p class="card-text mt-2">
                            <small class="text-muted">
                                Publicado em ${noticia.data || 'Data não disponível'} 
                                às ${noticia.hora || 'Hora não disponível'}
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