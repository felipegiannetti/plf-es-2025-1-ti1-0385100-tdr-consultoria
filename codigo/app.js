const API_URL = 'http://localhost:3000';

// Função para carregar eventos
async function carregarEventos() {
    try {
        const response = await fetch(`${API_URL}/eventos`);
        const eventos = await response.json();
        
        const featuresSection = document.querySelector('.features-section .container');
        featuresSection.innerHTML = '';
        
        eventos.forEach(evento => {
            featuresSection.innerHTML += `
                <div class="feature">
                    <img src="${evento.imagem}" alt="${evento.titulo}">
                    <h2>${evento.titulo}</h2>
                    <p>${evento.descricao}</p>
                    <p>Data: ${new Date(evento.data).toLocaleDateString()}</p>
                    <p>Preço: R$ ${evento.preco}</p>
                    <p>Vagas: ${evento.vagas}</p>
                    <button class="cta-button">Inscrever-se</button>
                </div>
            `;
        });
    } catch (error) {
        console.error('Erro ao carregar eventos:', error);
    }
}

// Carregar eventos quando a página carregar
document.addEventListener('DOMContentLoaded', carregarEventos);