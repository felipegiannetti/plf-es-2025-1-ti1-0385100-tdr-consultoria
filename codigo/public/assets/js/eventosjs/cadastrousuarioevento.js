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
                            <div class="inscrito-info">
                                <button class="btn-inscrito" disabled>Já Inscrito</button>
                                <p class="inscrito-message">
                                    Acesse o QR Code para ver a localização do evento. 
                                    </br>Seu nome está na lista de entrada. Ao chegar, informe seu nome 
                                    e realize o pagamento.
                                </p>
                            </div>
                            <div class="action-buttons">
                                <a href="qrcodeEvento.html?id=${eventId}" class="btn-qrcode">
                                    <i class="fas fa-qrcode"></i> Ver QR Code
                                </a>
                                <button class="btn-cancelar" id="btnCancelar">
                                    <i class="fas fa-times"></i> Cancelar Inscrição
                                </button>
                            </div>
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
                    // Password confirmation prompt
                    const { value: senha } = await Swal.fire({
                        title: 'Confirme sua Senha',
                        input: 'password',
                        inputLabel: 'Digite sua senha para confirmar a inscrição',
                        inputPlaceholder: 'Senha',
                        showCancelButton: true,
                        cancelButtonText: 'Cancelar',
                        confirmButtonText: 'Confirmar Inscrição',
                        customClass: {
                            popup: 'swal2-popup',
                            confirmButton: 'swal-custom-button',
                            cancelButton: 'swal-custom-button'
                        },
                        inputValidator: (value) => {
                            if (!value) {
                                return 'Digite sua senha para continuar';
                            }
                        }
                    });

                    if (!senha) return;

                    // Verify password
                    if (senha !== usuarioLogado.senha) {
                        await Swal.fire({
                            title: 'Senha Incorreta!',
                            text: 'A senha informada não está correta.',
                            icon: 'error',
                            confirmButtonText: 'Tentar Novamente',
                            customClass: {
                                popup: 'swal2-popup',
                                confirmButton: 'swal-custom-button'
                            }
                        });
                        return;
                    }

                    // Show loading
                    Swal.fire({
                        title: 'Processando...',
                        html: `
                            <div style="display: flex; flex-direction: column; align-items: center; gap: 15px;">
                                <div class="loading-spinner"></div>
                                <p>Realizando sua inscrição</p>
                                <div class="progress-bar">
                                    <div class="progress-fill"></div>
                                </div>
                            </div>
                        `,
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        showConfirmButton: false,
                        customClass: {
                            popup: 'swal2-popup'
                        },
                        didOpen: () => {
                            // Add custom loading styles
                            const loadingStyle = document.createElement('style');
                            loadingStyle.innerHTML = `
                                .loading-spinner {
                                    width: 40px;
                                    height: 40px;
                                    border: 4px solid #f3f3f3;
                                    border-top: 4px solid #ff7a00;
                                    border-radius: 50%;
                                    animation: spin 1s linear infinite;
                                }
                                
                                @keyframes spin {
                                    0% { transform: rotate(0deg); }
                                    100% { transform: rotate(360deg); }
                                }
                                
                                .progress-bar {
                                    width: 200px;
                                    height: 8px;
                                    background: #f3f3f3;
                                    border-radius: 4px;
                                    overflow: hidden;
                                }
                                
                                .progress-fill {
                                    height: 100%;
                                    background: linear-gradient(90deg, #ff7a00, #ff9a2e);
                                    width: 0%;
                                    border-radius: 4px;
                                    animation: fillProgress 8s ease-in-out forwards;
                                }
                                
                                @keyframes fillProgress {
                                    0% { width: 0%; }
                                    100% { width: 100%; }
                                }
                            `;
                            document.head.appendChild(loadingStyle);
                        }
                    });

                    // Verificar se já existe uma inscrição para este evento
                    const cadRes = await fetch(`${API_URL}/cadastroDeEventos?idEvento=${eventId}`);
                    const cadastros = await cadRes.json();

                    if (cadastros.length === 0) {
                        // Criar nova inscrição
                        await fetch(`${API_URL}/cadastroDeEventos`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                id: Date.now().toString(),
                                idEvento: eventId,
                                idUsuario: [usuarioLogado.id]
                            })
                        });
                    } else {
                        // Adicionar usuário à inscrição existente
                        const inscricaoExistente = cadastros[0];
                        if (!inscricaoExistente.idUsuario.includes(usuarioLogado.id)) {
                            inscricaoExistente.idUsuario.push(usuarioLogado.id);
                            
                            await fetch(`${API_URL}/cadastroDeEventos/${inscricaoExistente.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(inscricaoExistente)
                            });
                        }
                    }

                    // Wait for 8 seconds to ensure loading animation completes
                    await new Promise(resolve => setTimeout(resolve, 8000));

                    // Only close loading after the full duration
                    Swal.close();

                    // Small delay before redirect to ensure smooth transition
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    // Redirect to QR code page
                    window.location.href = `qrcodeEvento.html?id=${eventId}`;

                } catch (error) {
                    Swal.close();
                    console.error('Erro:', error);
                    await Swal.fire({
                        title: 'Erro!',
                        text: 'Erro ao realizar inscrição: ' + error.message,
                        icon: 'error',
                        confirmButtonText: 'OK',
                        customClass: {
                            popup: 'swal2-popup',
                            confirmButton: 'swal-custom-button'
                        }
                    });
                }
            });
        }

        // Add the cancellation handler after appending main to the document
        if (jaInscrito) {
            const btnCancelar = document.getElementById('btnCancelar');
            btnCancelar.addEventListener('click', async function() {
                try {
                    // Confirm cancellation
                    const result = await Swal.fire({
                        title: 'Cancelar Inscrição?',
                        text: 'Tem certeza que deseja cancelar sua inscrição neste evento?',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Sim, cancelar',
                        cancelButtonText: 'Não, manter',
                        customClass: {
                            popup: 'swal2-popup',
                            confirmButton: 'swal-custom-button',
                            cancelButton: 'swal-custom-button'
                        }
                    });

                    if (!result.isConfirmed) return;

                    // Show loading
                    Swal.fire({
                        title: 'Processando...',
                        html: `
                            <div style="display: flex; flex-direction: column; align-items: center; gap: 15px;">
                                <div class="loading-spinner"></div>
                                <p>Cancelando sua inscrição</p>
                                <div class="progress-bar">
                                    <div class="progress-fill-cancel"></div>
                                </div>
                            </div>
                        `,
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        showConfirmButton: false,
                        customClass: {
                            popup: 'swal2-popup'
                        },
                        didOpen: () => {
                            const cancelStyle = document.createElement('style');
                            cancelStyle.innerHTML = `
                                .progress-fill-cancel {
                                    height: 100%;
                                    background: linear-gradient(90deg, #ff3b30, #ff5449);
                                    width: 0%;
                                    border-radius: 4px;
                                    animation: fillProgressCancel 7s ease-in-out forwards;
                                }
                                
                                @keyframes fillProgressCancel {
                                    0% { width: 0%; }
                                    100% { width: 100%; }
                                }
                            `;
                            document.head.appendChild(cancelStyle);
                        }
                    });

                    // Get current registration
                    const inscricoesRes = await fetch(`${API_URL}/cadastroDeEventos?idEvento=${eventId}`);
                    const inscricoes = await inscricoesRes.json();
                    const inscricao = inscricoes.find(i => i.idUsuario.includes(usuarioLogado.id));

                    if (inscricao) {
                        // Remove user from registration
                        const updatedUsuarios = inscricao.idUsuario.filter(id => id !== usuarioLogado.id);
                        
                        if (updatedUsuarios.length === 0) {
                            // If no users left, delete the registration
                            await fetch(`${API_URL}/cadastroDeEventos/${inscricao.id}`, {
                                method: 'DELETE'
                            });
                        } else {
                            // Update with remaining users
                            await fetch(`${API_URL}/cadastroDeEventos/${inscricao.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    ...inscricao,
                                    idUsuario: updatedUsuarios
                                })
                            });
                        }

                        // Wait for 7 seconds before proceeding
                        await new Promise(resolve => setTimeout(resolve, 7000));

                        // Show success message with longer timer
                        await Swal.fire({
                            title: 'Inscrição Cancelada!',
                            text: 'Sua inscrição foi cancelada com sucesso.',
                            icon: 'success',
                            confirmButtonText: 'OK',
                            timer: 4000,
                            timerProgressBar: true,
                            customClass: {
                                popup: 'swal2-popup',
                                confirmButton: 'swal-custom-button'
                            }
                        });

                        // Small delay before reload
                        await new Promise(resolve => setTimeout(resolve, 1000));

                        // Reload page to update status
                        window.location.reload();
                    }
                } catch (error) {
                    console.error('Erro ao cancelar inscrição:', error);
                    await Swal.fire({
                        title: 'Erro!',
                        text: 'Erro ao cancelar inscrição: ' + error.message,
                        icon: 'error',
                        confirmButtonText: 'OK',
                        customClass: {
                            popup: 'swal2-popup',
                            confirmButton: 'swal-custom-button'
                        }
                    });
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

        .inscrito-info {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .inscrito-message {
            color: #fff;
            font-size: 0.9em;
            margin: 0;
            padding: 8px;
            background: rgba(255, 122, 0, 0.1);
            border-left: 3px solid #ff7a00;
            border-radius: 4px;
        }

        .evento-status {
            display: inline-flex;
            align-items: center;
            padding: 8px 16px;
            background: rgba(255, 122, 0, 0.1);
            border-radius: 20px;
            color: #fff;
            font-weight: 500;
            font-size: 0.95rem;
            border: 1px solid rgba(255, 122, 0, 0.3);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
            margin-right: 10px;
        }

        .evento-status::before {
            content: '';
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            margin-right: 8px;
            background: #ff7a00;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0% {
                transform: scale(0.95);
                box-shadow: 0 0 0 0 rgba(255, 122, 0, 0.7);
            }
            
            70% {
                transform: scale(1);
                box-shadow: 0 0 0 6px rgba(255, 122, 0, 0);
            }
            
            100% {
                transform: scale(0.95);
                box-shadow: 0 0 0 0 rgba(255, 122, 0, 0);
            }
        }

        .evento-status.lotado {
            background: rgba(255, 59, 48, 0.1);
            border-color: rgba(255, 59, 48, 0.3);
        }

        .evento-status.lotado::before {
            background: #ff3b30;
        }

        h5 {
            color: #fff;
            margin-bottom: 8px;
            font-size: 1.1rem;
            font-weight: 500;
        }
    `;
    style.textContent += `
        .action-buttons {
            display: flex;
            gap: 12px;
            align-items: center;
            flex-wrap: wrap;
        }

        .btn-cancelar {
            background: linear-gradient(135deg, #ff3b30 0%, #ff453a 100%);
            color: white;
            padding: 10px 18px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-weight: 500;
            font-size: 0.9rem;
            transition: all 0.3s ease;
            box-shadow: 0 2px 8px rgba(255, 59, 48, 0.2);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .btn-cancelar:hover {
            background: linear-gradient(135deg, #ff453a 0%, #ff5449 100%);
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(255, 59, 48, 0.4);
        }

        .btn-cancelar:active {
            transform: translateY(0);
            box-shadow: 0 2px 8px rgba(255, 59, 48, 0.3);
        }

        .btn-cancelar i {
            font-size: 1.1em;
            transition: transform 0.3s ease;
        }

        .btn-cancelar:hover i {
            transform: rotate(90deg);
        }

        /* Responsive design for mobile */
        @media (max-width: 768px) {
            .action-buttons {
                flex-direction: column;
                width: 100%;
            }

            .btn-cancelar,
            .btn-qrcode {
                width: 100%;
                justify-content: center;
            }
        }

        /* Animation for button states */
        .btn-cancelar:focus {
            outline: none;
            box-shadow: 0 0 0 3px rgba(255, 59, 48, 0.3);
        }

        .btn-cancelar:disabled {
            background: #ccc;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }
    `;
    document.head.appendChild(style);
});