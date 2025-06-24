const API_URL = '';

async function carregarEventos() {
    try {
        const response = await fetch(`${API_URL}/eventos`);
        const eventos = await response.json();

        eventos.forEach(evento => {
            featuresSection.innerHTML += `
                <div class="feature">
                    <img src="../../${evento.imagem}" alt="${evento.titulo}">
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

async function carregarDetalhesEvento() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const eventoId = urlParams.get('id');
        const usuarioId = urlParams.get('idUsuario');

        if (!eventoId) {
            document.getElementById('evento-detalhes').innerHTML = `
                <div class="alert alert-warning">ID do evento não foi especificado na URL.</div>
            `;
            return;
        }

        let usuario = null;
        if (usuarioId) {
            const userRes = await fetch(`${API_URL}/usuarios/${usuarioId}`);
            if (userRes.ok) {
                usuario = await userRes.json();
            } else {
                console.warn('Usuário não encontrado');
            }
        }

        const response = await fetch(`${API_URL}/eventos?id=${eventoId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const eventos = await response.json();
        const evento = eventos[0];
        if (!evento) throw new Error('Evento não encontrado com o ID informado.');

        const container = document.getElementById('evento-detalhes');
        container.innerHTML = `
            <div class="card mb-4 margemtopodetalhes">
                <div class="row g-0">
                    <div class="col-md-6">
                        <img src="../../${evento.imagem}" class="img-fluid rounded-start w-100 h-100" alt="${evento.titulo}">
                    </div>
                    <div class="col-md-6">
                        <div class="card-body d-flex flex-column h-100">
                            <div>
                                <h2 class="card-title">${evento.titulo}</h2>
                                <p class="card-text">${evento.descricao}</p>
                                <div class="event-details">
                                    <p><i class="far fa-calendar"></i> Data: ${new Date(evento.data).toLocaleDateString('pt-BR')} 
                                       <i class="far fa-clock ms-2"></i> ${new Date(evento.data).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}</p>
                                    <p><i class="fas fa-map-marker-alt"></i> Local: ${evento.local}</p>
                                    <p><i class="fas fa-ticket-alt"></i> Vagas disponíveis: ${evento.vagas}</p>
                                    <p><i class="fas fa-tag"></i> Categoria: ${evento.categoria}</p>
                                    <p><i class="fas fa-dollar-sign"></i> Preço: R$ ${evento.preco.toFixed(2)}</p>
                                </div>
                            </div>
                            <div class="text-center mt-4 mb-4">
                                <a href="avaliacoesgrid.html" class="btn btn-primary btn-lg w-100">
                                <i class="fas fa-star me-2"></i>Ver Avaliações do Evento
                            </a>
                            </div>
                            <a id="btnInscrever" href="cadastrousuariosevento.html?id=${evento.id}" class="btn btn-primary btn-lg w-100 mb-3">Inscrever-se</a>
                        </div>
                    </div>
                </div>
            </div>
            <div class="text-center">
                <a href="exibicaoeventos.html" class="btn btn-secondary btn-lg w-100">
                    <i class="fas fa-arrow-left me-2"></i>Voltar para Lista de Eventos
                </a>
            </div>
        `;

        document.getElementById('btnInscrever').addEventListener('click', async function (e) {
            e.preventDefault();

            if (!usuarioId) {
                alert('Usuário não está logado. Por favor, faça login para se inscrever.');
                return;
            }

            try {
                const cadRes = await fetch(`${API_URL}/cadastroDeEventos?idEvento=${eventoId}`);
                const cadastros = await cadRes.json();

                if (cadastros.length === 0) {
                    await fetch(`${API_URL}/cadastroDeEventos`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id: Date.now().toString(),
                            idEvento: eventoId,
                            idUsuario: [usuarioId]
                        })
                    });
                } else {
                    const cadastro = cadastros[0];
                    const usuariosArray = cadastro.idUsuario || [];
                    if (!usuariosArray.includes(usuarioId)) {
                        usuariosArray.push(usuarioId);
                        await fetch(`${API_URL}/cadastroDeEventos/${cadastro.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ idUsuario: usuariosArray })
                        });
                    }
                }

                window.location.href = `cadastrousuariosevento.html?id=${eventoId}`;
            } catch (err) {
                alert('Erro ao inscrever: ' + err.message);
            }
        });

    } catch (error) {
        console.error('Erro ao carregar detalhes do evento:', error);
        document.getElementById('evento-detalhes').innerHTML = `
            <div class="alert alert-danger">
                Erro ao carregar detalhes do evento. Por favor, tente novamente mais tarde.<br>
                Erro: ${error.message}
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    carregarEventos();
    carregarDetalhesEvento();

    const estrelas = document.querySelectorAll(".estrela");
    const comentarioInput = document.getElementById("comentario");
    const nomeInput = document.getElementById("nome");
    const enviarBtn = document.getElementById("enviar-avaliacao");

    let notaSelecionada = 0;

    estrelas.forEach(estrela => {
        estrela.addEventListener("click", () => {
            notaSelecionada = parseInt(estrela.getAttribute("data-value"));
            estrelas.forEach(e => e.classList.remove("selecionada"));
            for (let i = 0; i < notaSelecionada; i++) {
                estrelas[i].classList.add("selecionada");
            }
        });
    });

    enviarBtn?.addEventListener("click", async () => {
        const comentario = comentarioInput.value.trim();
        const nome = nomeInput.value.trim();

        if (notaSelecionada === 0 || comentario === "" || nome === "") {
            alert("Por favor, preencha todos os campos e selecione uma nota.");
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const eventoId = urlParams.get('id');

        const avaliacao = {
            idavaliacao: Date.now(),
            idevento: eventoId,
            nome: nome,
            comentario: comentario,
            rating: notaSelecionada,
            data: new Date().toLocaleString('pt-BR')
        };

        try {
            const response = await fetch(`${API_URL}/avaliacoeseventos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(avaliacao)
            });

            if (response.ok) {
                alert('Avaliação enviada com sucesso!');
                nomeInput.value = '';
                comentarioInput.value = '';
                estrelas.forEach(e => e.classList.remove("selecionada"));
                notaSelecionada = 0;
            } else {
                throw new Error('Erro ao enviar avaliação.');
            }
        } catch (error) {
            console.error('Erro ao enviar avaliação:', error);
            alert('Não foi possível enviar sua avaliação. Tente novamente mais tarde.');
        }
    });
});
