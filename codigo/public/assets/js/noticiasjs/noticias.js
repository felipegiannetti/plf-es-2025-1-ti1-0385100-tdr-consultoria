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
        if (!response.ok) throw new Error('Erro ao carregar notícias');
        
        const noticias = await response.json();
        
        if (noticias.length === 0) {
            document.getElementById('noticias-card').innerHTML = `
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i> Nenhuma notícia disponível no momento.
                </div>
            `;
            return;
        }

        const container = document.getElementById('noticias-card');
        container.className = 'solution_cards_box';
        
        container.innerHTML = noticias.map(noticia => `
            <div class="solution_card">
                <div class="hover_color_bubble"></div>
                <div class="card-img-top" style="background-image: url('${noticia.imagem}')"></div>
                <div class="solu_title">
                    <h3 class="card-title">${noticia.titulo}</h3>
                </div>
                <div class="solu_description">
                    <p class="card-text">${noticia.descricaoBreve}</p>
                    <div class="card-meta">
                        <span><i class="far fa-calendar"></i> ${new Date(noticia.data).toLocaleDateString()}</span>
                        <span><i class="far fa-user"></i> ${noticia.autor}</span>
                    </div>
                    <a href="noticia-detalhes.html?id=${noticia.id}" class="read_more_btn">Ler mais</a>
                </div>
            </div>
        `).join('');

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
        console.error('Erro:', error);
        document.getElementById('noticias-card').innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle"></i> Erro ao carregar notícias: ${error.message}
            </div>
        `;
    }
}

// Carregar notícias quando a página for carregada
document.addEventListener('DOMContentLoaded', carregarNoticias);

document.getElementById('form-cadastro').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const form = this;
    const formData = new FormData(form);
    
    const noticiaData = {
        titulo: formData.get('titulo'),
        descricaoBreve: formData.get('descricao_breve'),
        textoCompleto: formData.get('texto_completo'),
        categoria: formData.get('categoria'),
        autor: formData.get('autor'),
        data: new Date().toISOString(),
        imagem: formData.get('imagem')
    };

    try {
        const response = await fetch(`${API_URL}/noticias`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(noticiaData)
        });

        if (!response.ok) throw new Error('Erro ao cadastrar notícia');
        
        const novaNoticia = await response.json();
        
        // Mostrar mensagem de sucesso
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-success mt-3';
        alertDiv.innerHTML = '<i class="fas fa-check-circle"></i> Notícia cadastrada com sucesso! Redirecionando...';
        form.insertAdjacentElement('beforebegin', alertDiv);

        // Redirecionar após 2 segundos
        setTimeout(() => {
            window.location.href = 'noticias.html';
        }, 2000);

    } catch (error) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger mt-3';
        alertDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${error.message}`;
        form.insertAdjacentElement('beforebegin', alertDiv);
    }
});

