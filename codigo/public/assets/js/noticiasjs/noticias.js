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
        titulo: "Hotmart FIRE: O Maior Evento de Marketing Digital",
        descricao: "Prepare-se para o maior evento de marketing digital da América Latina",
        texto_completo: "O Hotmart FIRE 2025 promete reunir os maiores nomes do marketing digital em São Paulo. Com mais de 150 palestrantes internacionais e nacionais, o evento abordará temas como vendas online, tráfego pago, copywriting e muito mais. Garanta sua vaga para os dias 15 a 17 de julho no Allianz Parque.",
        imagem: "https://picsum.photos/300/200?random=1",
        data: "2025-07-15",
        hora: "09:00"
    },
    {
        id: 2,
        titulo: "Subido: Imersão em Gestão de Tráfego",
        descricao: "O evento que vai revolucionar sua forma de fazer tráfego pago",
        texto_completo: "O Subido 2025 traz três dias intensos de aprendizado sobre gestão de tráfego com especialistas do mercado. Aprenda estratégias avançadas de Facebook Ads, Google Ads e TikTok Ads. O evento acontecerá nos dias 20 a 22 de agosto no WTC São Paulo.",
        imagem: "https://picsum.photos/300/200?random=2",
        data: "2025-08-20",
        hora: "08:30"
    },
    {
        id: 3,
        titulo: "Summit Empresarial: Inovação e Liderança",
        descricao: "Encontro dos maiores líderes empresariais do Brasil",
        texto_completo: "O Summit Empresarial 2025 reunirá CEOs, empreendedores e líderes de grandes empresas para discutir o futuro dos negócios. Com foco em inovação, tecnologia e liderança, o evento acontecerá nos dias 10 e 11 de setembro no Centro de Convenções Frei Caneca.",
        imagem: "https://picsum.photos/300/200?random=3",
        data: "2025-09-10",
        hora: "10:00"
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
    const mockNoticias = [
        {
            id: 1,
            titulo: "Hotmart FIRE: O Maior Evento de Marketing Digital",
            descricao: "Prepare-se para o maior evento de marketing digital da América Latina",
            texto_completo: "O Hotmart FIRE 2025 promete reunir os maiores nomes do marketing digital em São Paulo. Com mais de 150 palestrantes internacionais e nacionais, o evento abordará temas como vendas online, tráfego pago, copywriting e muito mais. Garanta sua vaga para os dias 15 a 17 de julho no Allianz Parque.",
            imagem: "https://picsum.photos/300/200?random=1",
            data: "2025-07-15",
            hora: "09:00"
        },
        {
            id: 2,
            titulo: "Subido: Imersão em Gestão de Tráfego",
            descricao: "O evento que vai revolucionar sua forma de fazer tráfego pago",
            texto_completo: "O Subido 2025 traz três dias intensos de aprendizado sobre gestão de tráfego com especialistas do mercado. Aprenda estratégias avançadas de Facebook Ads, Google Ads e TikTok Ads. O evento acontecerá nos dias 20 a 22 de agosto no WTC São Paulo.",
            imagem: "https://picsum.photos/300/200?random=2",
            data: "2025-08-20",
            hora: "08:30"
        },
        {
            id: 3,
            titulo: "Summit Empresarial: Inovação e Liderança",
            descricao: "Encontro dos maiores líderes empresariais do Brasil",
            texto_completo: "O Summit Empresarial 2025 reunirá CEOs, empreendedores e líderes de grandes empresas para discutir o futuro dos negócios. Com foco em inovação, tecnologia e liderança, o evento acontecerá nos dias 10 e 11 de setembro no Centro de Convenções Frei Caneca.",
            imagem: "https://picsum.photos/300/200?random=3",
            data: "2025-09-10",
            hora: "10:00"
        }
    ];

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

    // Iniciar com os dados mockados
    exibirNoticias(mockNoticias);
});