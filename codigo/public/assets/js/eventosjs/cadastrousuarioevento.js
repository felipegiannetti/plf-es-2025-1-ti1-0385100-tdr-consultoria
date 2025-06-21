document.addEventListener('DOMContentLoaded', async function () {
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('id');
    const API_URL = 'http://localhost:3000';

    // Improved user login check
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado')) || null;
    console.log('Usuario antes da verificação:', usuarioLogado);
    
    // Better login verification
    const usuarioEstaLogado = Boolean(usuarioLogado && usuarioLogado.id);
    console.log('Status do login:', usuarioEstaLogado);

    const main = document.createElement('div');
    main.className = 'evento-container';

    if (!eventId) {
        main.innerHTML = `<div class="erro-evento">Evento não encontrado.</div>`;
        document.getElementById('main').appendChild(main);
        return;
    }

    try {
        const response = await fetch(`${API_URL}/eventos/${eventId}`);
        if (!response.ok) throw new Error('Evento não encontrado');
        const evento = await response.json();

        // Verificar inscrições apenas se usuário estiver logado
        let jaInscrito = false;
        let numeroInscritos = 0;

        if (usuarioLogado) {
            const inscricoes = await fetch(`${API_URL}/cadastroDeEventos`);
            const inscricoesData = await inscricoes.json();
            
            jaInscrito = inscricoesData.some(inscricao => 
                inscricao.idEvento === eventId && 
                inscricao.idUsuario.includes(usuarioLogado.id)
            );

            numeroInscritos = inscricoesData
                .filter(inscricao => inscricao.idEvento === eventId)
                .reduce((total, inscricao) => total + inscricao.idUsuario.length, 0);
        }

        // Verificar se há vagas disponíveis
        const vagasDisponiveis = evento.vagas - numeroInscritos;

        // Adicionar log para debug
        console.log('Usuario logado:', usuarioLogado);

        main.innerHTML = `
            <div class="evento-header">
                <div>
                    <h1 class="evento-titulo">${evento.titulo}</h1>
                    <p class="evento-descricao">${evento.descricao}</p>
                </div>
                <div>
                    <span class="evento-data">${new Date(evento.data).toLocaleDateString('pt-BR')}</span>
                </div>
            </div>
            <div class="evento-status-area">
                <div>
                    <h5>Status do Evento</h5>
                    <span class="evento-status">
                        ${vagasDisponiveis > 0 
                            ? `Vagas disponíveis: ${vagasDisponiveis}` 
                            : 'Evento Lotado'}
                    </span>
                </div>
                <div class="evento-status-btns">
                    ${jaInscrito 
                        ? `<div class="btn-group">
                            <button class="btn-inscrito" disabled>Já Inscrito</button>
                            <a href="qrcodeEvento.html?id=${eventId}" class="btn-qrcode">
                                <i class="fas fa-qrcode"></i> Ver QR Code
                            </a>
                          </div>`
                        : `<button class="btn-inscrever" id="btnInscrever" ${!usuarioEstaLogado ? 'data-need-login="true"' : ''}>
                            ${usuarioEstaLogado 
                                ? (vagasDisponiveis <= 0 ? 'Lotado' : 'Inscrever-se')
                                : 'Faça login para se inscrever'}
                           </button>`
                    }
                </div>
            </div>
            <div class="evento-info-area">
                <div>
                    <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7501.616584633948!2d-43.938680124014546!3d-19.932481838387364!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xa699dcfc943a3b%3A0x97ae94fc166049d0!2sPUC%20Minas%20-%20Ed.%20Fernanda%20-%20Pr%C3%A9dio%204!5e0!3m2!1spt-BR!2sbr!4v1749510720297!5m2!1spt-BR!2sbr" width="500" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
                </div>
                <div>
                    <h6>Endereço do Evento</h6>
                    <p>${evento.local}</p>
                    <a href="${evento.localmapa}" target="_blank" class="btn-mapa">
                        <span class="evento-icone">📍</span> Ver no Google Maps
                    </a>
                </div>
            </div>
        `;

        // First append the main element
        document.getElementById('main').appendChild(main);

        // Then get the button and add the event listener only if it exists
        const btnInscrever = document.getElementById('btnInscrever');
        if (btnInscrever && !jaInscrito) {
            btnInscrever.addEventListener('click', async function() {
                const needsLogin = this.getAttribute('data-need-login') === 'true';
                
                if (needsLogin) {
                    localStorage.setItem('returnUrl', window.location.href);
                    window.location.href = '../login/loginregistro.html';
                    return;
                }

                try {
                    // Verificar novamente se o usuário já está inscrito
                    const inscricoesCheck = await fetch(`${API_URL}/cadastroDeEventos`);
                    const inscricoesData = await inscricoesCheck.json();
                    const jaInscrito = inscricoesData.some(inscricao => 
                        inscricao.idEvento === eventId && 
                        inscricao.idUsuario.includes(usuarioLogado.id)
                    );

                    if (jaInscrito) {
                        alert('Você já está inscrito neste evento!');
                        window.location.reload();
                        return;
                    }

                    // Verificar novamente se há vagas disponíveis
                    const numeroAtualInscritos = inscricoesData
                        .filter(inscricao => inscricao.idEvento === eventId)
                        .reduce((total, inscricao) => total + inscricao.idUsuario.length, 0);

                    if (numeroAtualInscritos >= evento.vagas) {
                        alert('Este evento já está lotado!');
                        window.location.href = 'exibicaoeventos.html';
                        return;
                    }

                    // Criar nova inscrição
                    const inscricaoData = {
                        id: Date.now().toString(),
                        idEvento: eventId,
                        idUsuario: [usuarioLogado.id]
                    };

                    const response = await fetch(`${API_URL}/cadastroDeEventos`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(inscricaoData)
                    });

                    if (!response.ok) throw new Error('Erro ao realizar inscrição');

                    // Verificar se atingiu limite de vagas
                    const novoNumeroInscritos = numeroAtualInscritos + 1;
                    if (novoNumeroInscritos >= evento.vagas) {
                        // Desativar evento
                        evento.status = 'inativo';
                        await fetch(`${API_URL}/eventos/${eventId}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(evento)
                        });
                    }

                    alert('Inscrição realizada com sucesso!');
                    window.location.href = 'qrcodeEvento.html?id=' + eventId;

                } catch (error) {
                    console.error('Erro:', error);
                    alert('Erro ao realizar inscrição: ' + error.message);
                }
            });
        }

    } catch (err) {
        main.innerHTML = `<div class="erro-evento">Erro ao carregar evento: ${err.message}</div>`;
        document.getElementById('main').appendChild(main);
    }

    // Add CSS styles
    const style = document.createElement('style');
    style.textContent = `
        .evento-status-btns {
            display: flex;
            gap: 10px;
            align-items: center;
        }

        .btn-group {
            display: flex;
            gap: 10px;
        }

        .btn-inscrito {
            background: #666;
            color: white;
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: not-allowed;
            opacity: 0.7;
        }

        .btn-qrcode {
            background: #ff7a00;
            color: white;
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
        }

        .btn-qrcode:hover {
            background: #ff9a2e;
            color: white;
            text-decoration: none;
        }

        .btn-qrcode i {
            font-size: 1.1em;
        }
    `;
    document.head.appendChild(style);
});