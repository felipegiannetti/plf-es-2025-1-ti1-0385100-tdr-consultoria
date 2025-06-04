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
                    <div class="card-img-top" style="background-image: url('${noticia.imagem}')"></div>
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

    // Adicionar efeitos de hover
    $('.card').on('mouseenter', function() {
        $(this).find('.card-text').slideDown(300);
    });

    $('.card').on('mouseleave', function() {
        $(this).find('.card-text').css({
            'display': 'none'
        });
    });
}

// Carregar notícias quando a página for carregada
document.addEventListener('DOMContentLoaded', carregarNoticias);

// Simulated news data
const mockNoticias = [
    {
        id: 1,
        titulo: "Startup Brasileira Recebe Investimento Recorde",
        descricao: "Empresa de tecnologia financeira atrai R$ 500 milhões em rodada Série C",
        imagem: "https://picsum.photos/300/200",
        data: "2025-05-25",
        texto: "Uma startup brasileira do setor fintech acaba de receber o maior investimento do ano na América Latina..."
    },
    {
        id: 2,
        titulo: "Nova Lei Beneficia Pequenos Empreendedores",
        descricao: "Governo aprova medidas de simplificação tributária",
        imagem: "https://picsum.photos/300/201",
        data: "2025-05-28",
        texto: "O Congresso Nacional aprovou uma nova legislação que simplifica a tributação para pequenas empresas..."
    },
    {
        id: 3,
        titulo: "Programa de Aceleração Abre Inscrições",
        descricao: "Y Combinator anuncia programa exclusivo para startups latino-americanas",
        imagem: "https://picsum.photos/300/202",
        data: "2025-06-01",
        texto: "A renomada aceleradora Y Combinator anunciou seu primeiro programa focado exclusivamente em startups..."
    }
];

// Function to create news cards
function criarCards() {
    const container = document.getElementById('noticias-card');
    let htmlContent = '<div class="card-group">';

    mockNoticias.forEach(noticia => {
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

// Initialize when document is ready
$(document).ready(function() {
    criarCards();
});