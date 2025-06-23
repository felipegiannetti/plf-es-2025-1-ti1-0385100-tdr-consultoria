const main = document.querySelector("main");

document.addEventListener('DOMContentLoaded', async function() {
    // Função para pegar parâmetros da URL
    function getUrlParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    // Pega o ID do evento da URL
    const eventoId = getUrlParameter('id');
    
    if (!eventoId) {
        mostrarErro('ID do evento não fornecido na URL');
        return;
    }

    try {
        // Busca os dados do evento no db.json
        const response = await fetch(`http://localhost:3000/eventos/${eventoId}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Evento não encontrado');
            } else {
                throw new Error(`Erro do servidor: ${response.status}`);
            }
        }

        const evento = await response.json();
        
        // Verifica se o evento tem o campo localmapa
        if (!evento.localmapa || evento.localmapa.trim() === '') {
            mostrarErro('Link de localização não disponível para este evento');
            return;
        }

        // Gera o QR Code usando a API
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(evento.localmapa)}`;
        
        // Atualiza a imagem do QR Code
        const imgElement = document.querySelector('#main img');
        if (imgElement) {
            imgElement.src = qrCodeUrl;
            imgElement.alt = `QR Code para localização do evento: ${evento.titulo}`;
            imgElement.style.maxWidth = '300px';
            imgElement.style.height = 'auto';
        }

        // Adiciona informações do evento na página
        adicionarInformacoesEvento(evento);

    } catch (error) {
        console.error('Erro ao carregar evento:', error);
        
        // Verifica se é erro de conexão
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            mostrarErroConexao();
        } else {
            mostrarErro(error.message);
        }
    }
});

// Função para mostrar erro de conexão
function mostrarErroConexao() {
    const mainElement = document.getElementById('main');
    if (mainElement) {
        mainElement.innerHTML = `
            <div class="container my-5">
                <div class="card">
                    <div class="card-body text-center">
                        <div class="mb-4">
                            <i class="fas fa-exclamation-triangle text-warning" style="font-size: 4rem;"></i>
                        </div>
                        <h2 class="text-danger">Erro de Conexão</h2>
                        <p class="fs-5 mb-4">Não foi possível conectar ao servidor. Verifique se:</p>
                        <div class="text-start mb-4">
                            <ul class="list-unstyled">
                                <li class="mb-2"><i class="fas fa-server text-warning me-2"></i>O json-server está rodando</li>
                                <li class="mb-2"><i class="fas fa-terminal text-warning me-2"></i>Execute: <code class="bg-dark text-light px-2 py-1 rounded">json-server --watch db.json</code></li>
                                <li class="mb-2"><i class="fas fa-network-wired text-warning me-2"></i>A conexão com localhost:3000 está disponível</li>
                            </ul>
                        </div>
                        <div class="mt-4">
                            <button class="btn btn-primary me-2" onclick="location.reload()">
                                <i class="fas fa-redo me-2"></i>Tentar Novamente
                            </button>
                            <a href="../../../index.html" class="btn btn-secondary">
                                <i class="fas fa-home me-2"></i>Voltar para Home
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Função para mostrar erro genérico
function mostrarErro(mensagem) {
    const mainElement = document.getElementById('main');
    if (mainElement) {
        mainElement.innerHTML = `
            <div class="container my-5">
                <div class="card">
                    <div class="card-body text-center">
                        <div class="mb-4">
                            <i class="fas fa-exclamation-circle text-danger" style="font-size: 4rem;"></i>
                        </div>
                        <h2 class="text-danger">Erro</h2>
                        <p class="fs-5 mb-4">${mensagem}</p>
                        <div class="mt-4">
                            <button class="btn btn-secondary me-2" onclick="window.history.back()">
                                <i class="fas fa-arrow-left me-2"></i>Voltar
                            </button>
                            <button class="btn btn-primary me-2" onclick="location.reload()">
                                <i class="fas fa-redo me-2"></i>Tentar Novamente
                            </button>
                            <a href="exibicaoeventos.html" class="btn btn-outline-secondary">
                                <i class="fas fa-list me-2"></i>Lista de Eventos
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Função para adicionar informações do evento na página
function adicionarInformacoesEvento(evento) {
    const mainElement = document.getElementById('main');
    
    // Cria container com informações do evento
    const infoDiv = document.createElement('div');
    infoDiv.className = 'container my-4';
    infoDiv.innerHTML = `
        <div class="card mb-4">
            <div class="card-header text-center">
                <h3 class="mb-0">
                    <i class="fas fa-qrcode me-2"></i>QR Code de Localização
                </h3>
            </div>
            <div class="card-body text-center">
                <h4 class="text-primary mb-3">${evento.titulo}</h4>
                <p class="text-mutedd mb-3">
                    <i class="fas fa-map-marker-alt me-2"></i>${evento.local}
                </p>
                <p class="text-mutedd mb-4">
                    <i class="fas fa-calendar-alt me-2"></i>${new Date(evento.data).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </p>
                
                <div class="qr-code-container mb-4">
                    
                </div>
                
                <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i>
                    <strong>Como usar:</strong> Escaneie o QR Code com seu celular para abrir a localização no mapa
                </div>
                
                <div class="mt-4">
                    <button class="btn btn-secondary me-2" onclick="window.history.back()">
                        <i class="fas fa-arrow-left me-2"></i>Voltar
                    </button>
                    <a href="${evento.localmapa}" target="_blank" class="btn btn-primary me-2">
                        <i class="fas fa-external-link-alt me-2"></i>Abrir no Navegador
                    </a>
                    <button class="btn btn-outline-primary" onclick="window.print()">
                        <i class="fas fa-print me-2"></i>Imprimir QR Code
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Move a imagem do QR Code para o container apropriado
    const qrContainer = infoDiv.querySelector('.qr-code-container');
    const imgElement = mainElement.querySelector('img');
    
    if (imgElement && qrContainer) {
        qrContainer.appendChild(imgElement);
        imgElement.classList.add('img-fluid', 'border', 'rounded', 'shadow');
    }
    
    // Substitui o conteúdo do main
    mainElement.innerHTML = '';
    mainElement.appendChild(infoDiv);
}

