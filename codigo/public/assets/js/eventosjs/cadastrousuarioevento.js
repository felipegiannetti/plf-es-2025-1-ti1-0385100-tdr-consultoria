document.addEventListener('DOMContentLoaded', async function () {
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('id');
    const API_URL = 'http://localhost:3000/eventos';

    // Elementos principais
    const main = document.createElement('div');
    main.className = 'evento-container';

    if (!eventId) {
        main.innerHTML = `<div class="erro-evento">Evento não encontrado.</div>`;
        document.getElementById('main').appendChild(main);
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${eventId}`);
        if (!response.ok) throw new Error('Evento não encontrado');
        const evento = await response.json();

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
                    <h5>Status do pedido</h5>
                    <span class="evento-status">Cadastro Realizado com Sucesso</span>
                </div>
                <div class="evento-status-btn">
                    <div>
                        <h5>Status do pedido <span class="evento-icone">🎟️</span></h5>
                        <button class="btn-inscrever" id="btnInscrever">Acessar Inscrição</button>
                    </div>    
                    <div class ="IconStatus"><svg width = 100px fill="#25b11b" viewBox="0 0 32 32" enable-background="new 0 0 32 32" version="1.1" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#25b11b" stroke-width="0"> <g id="Approved"> <g> <path d="M16,1C7.729,1,1,7.729,1,16s6.729,15,15,15s15-6.729,15-15S24.271,1,16,1z M16,29C8.832,29,3,23.168,3,16S8.832,3,16,3 s13,5.832,13,13S23.168,29,16,29z"></path> <path d="M23.317,10.27l-10.004,9.36l-4.629-4.332c-0.403-0.377-1.035-0.356-1.413,0.047c-0.377,0.403-0.356,1.036,0.047,1.413 l5.313,4.971c0.192,0.18,0.438,0.27,0.683,0.27s0.491-0.09,0.683-0.27l10.688-10c0.403-0.377,0.424-1.01,0.047-1.413 C24.353,9.913,23.719,9.892,23.317,10.27z"></path> </g> </g> <g id="Approved_1_"></g> <g id="File_Approve"></g> <g id="Folder_Approved"></g> <g id="Security_Approved"></g> <g id="Certificate_Approved"></g> <g id="User_Approved"></g> <g id="ID_Card_Approved"></g> <g id="Android_Approved"></g> <g id="Privacy_Approved"></g> <g id="Approved_2_"></g> <g id="Message_Approved"></g> <g id="Upload_Approved"></g> <g id="Download_Approved"></g> <g id="Email_Approved"></g> <g id="Data_Approved"></g> </g><g id="SVGRepo_iconCarrier"> <g id="Approved"> <g> <path d="M16,1C7.729,1,1,7.729,1,16s6.729,15,15,15s15-6.729,15-15S24.271,1,16,1z M16,29C8.832,29,3,23.168,3,16S8.832,3,16,3 s13,5.832,13,13S23.168,29,16,29z"></path> <path d="M23.317,10.27l-10.004,9.36l-4.629-4.332c-0.403-0.377-1.035-0.356-1.413,0.047c-0.377,0.403-0.356,1.036,0.047,1.413 l5.313,4.971c0.192,0.18,0.438,0.27,0.683,0.27s0.491-0.09,0.683-0.27l10.688-10c0.403-0.377,0.424-1.01,0.047-1.413 C24.353,9.913,23.719,9.892,23.317,10.27z"></path> </g> </g> <g id="Approved_1_"></g> <g id="File_Approve"></g> <g id="Folder_Approved"></g> <g id="Security_Approved"></g> <g id="Certificate_Approved"></g> <g id="User_Approved"></g> <g id="ID_Card_Approved"></g> <g id="Android_Approved"></g> <g id="Privacy_Approved"></g> <g id="Approved_2_"></g> <g id="Message_Approved"></g> <g id="Upload_Approved"></g> <g id="Download_Approved"></g> <g id="Email_Approved"></g> <g id="Data_Approved"></g> </g></svg></div>
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

        document.getElementById('main').appendChild(main);

        document.getElementById('btnInscrever').addEventListener('click', function () {
            alert('Funcionalidade de inscrição ainda não implementada.');
        });

    } catch (err) {
        main.innerHTML = `<div class="erro-evento">Erro ao carregar evento: ${err.message}</div>`;
        document.getElementById('main').appendChild(main);
    }
});