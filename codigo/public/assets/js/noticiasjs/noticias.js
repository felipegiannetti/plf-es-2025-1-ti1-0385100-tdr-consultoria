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
        titulo: "Inovação em Consultoria Empresarial",
        descricao: "Nova abordagem revoluciona mercado",
        texto_completo: "Nossa equipe desenvolveu uma metodologia inovadora que combina análise de dados em tempo real com estratégias personalizadas de crescimento. Os resultados mostram um aumento médio de 45% na eficiência operacional dos nossos clientes.",
        imagem: "https://picsum.photos/300/200?random=1",
        data: "2025-05-25",
        hora: "14:30"
    },
    {
        id: 2,
        titulo: "Transformação Digital nas PMEs",
        descricao: "Pequenas empresas lideram mudança tecnológica",
        texto_completo: "O processo de transformação digital tem sido especialmente impactante para pequenas e médias empresas. Nossa consultoria tem ajudado dezenas de negócios a implementarem soluções tecnológicas que antes eram exclusivas de grandes corporações.",
        imagem: "https://picsum.photos/300/200?random=2",
        data: "2025-05-28",
        hora: "09:15"
    },
    {
        id: 3,
        titulo: "Sustentabilidade nos Negócios",
        descricao: "ESG como diferencial competitivo",
        texto_completo: "Empresas que adotam práticas ESG têm mostrado resultados superiores no mercado. Nossa consultoria especializada ajuda organizações a implementarem estratégias sustentáveis sem comprometer a lucratividade.",
        imagem: "https://picsum.photos/300/200?random=3",
        data: "2025-06-01",
        hora: "16:45"
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
    const API_URL = 'http://localhost:3000';

    async function carregarNoticias() {
        try {
            const response = await fetch(`${API_URL}/noticias`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const noticias = await response.json();
            exibirNoticias(noticias);
        } catch (error) {
            console.error('Erro ao carregar notícias:', error);
            document.getElementById('noticias-card').innerHTML = 
                '<div class="alert alert-danger">Erro ao carregar notícias. Por favor, tente novamente mais tarde.</div>';
        }
    }

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
                                ${noticia.titulo}<hr>
                            </h5>
                            <p class="card-text description">${noticia.descricao}</p>
                            <p class="card-text expanded-text">${noticia.texto_completo}</p>
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
        });

        $('.card').on('mouseleave', function() {
            $(this).find('.expanded-text').slideUp(300);
            $(this).find('.description').slideDown(300);
        });
    }

    carregarNoticias();
});