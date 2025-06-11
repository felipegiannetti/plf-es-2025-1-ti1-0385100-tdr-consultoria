const API_URL = 'http://localhost:3000';

const eventForm = document.getElementById('eventForm');
const eventsTable = document.getElementById('eventsTable');

let imagemAtual = ''; 

document.addEventListener('DOMContentLoaded', loadEvents);

async function uploadImagem(file) {
    try {
        const validExtensions = ['jpg', 'jpeg', 'png'];
        const fileExtension = file.name.split('.').pop().toLowerCase();
        
        if (!validExtensions.includes(fileExtension)) {
            throw new Error('O arquivo deve ter extensão .jpg, .jpeg ou .png');
        }

        const imagePath = `public/assets/img/eventos/${file.name}`;
        
        console.log('Image path being saved:', imagePath);
        
        return imagePath;
        
    } catch (error) {
        console.error('Erro no processamento da imagem:', error);
        throw new Error(`Erro no processamento da imagem: ${error.message}`);
    }
}

async function handleFormSubmit(event) {
    event.preventDefault();
    
    try {
        const imageFile = document.getElementById('imagem').files[0];

        if (!imageFile && !imagemAtual) {
            throw new Error('É necessário selecionar uma imagem para o evento');
        }

        let finalImageUrl = imagemAtual;
        if (imageFile) {
            finalImageUrl = await uploadImagem(imageFile);
        }

        const eventData = {
            id: document.getElementById('eventId').value || Date.now().toString(),
            titulo: document.getElementById('titulo').value,
            data: document.getElementById('data').value,
            descricao: document.getElementById('descricao').value,
            categoria: document.getElementById('categoria').value,
            vagas: parseInt(document.getElementById('vagas').value),
            preco: parseFloat(document.getElementById('preco').value),
            local: document.getElementById('local').value,
            localmapa: document.getElementById('localmapa').value,
            status: document.getElementById('status').value,
            imagem: finalImageUrl 
        };

        const eventId = document.getElementById('eventId').value;
        const method = eventId ? 'PUT' : 'POST';
        const url = eventId ? `${API_URL}/eventos/${eventId}` : `${API_URL}/eventos`;

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(eventData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        clearForm();
        loadEvents();
        alert('Evento salvo com sucesso!');

    } catch (error) {
        console.error('Error:', error);
        alert('Erro ao salvar evento: ' + error.message);
    }
}

document.getElementById('eventForm').addEventListener('submit', handleFormSubmit);

function isEventPast(eventDate) {
    const now = new Date();
    return new Date(eventDate) < now;
}

async function loadEvents() {
    try {
        const response = await fetch('http://localhost:3000/eventos');
        const eventos = await response.json();
        
        const activeEvents = [];
        const inactiveEvents = [];

        eventos.forEach(evento => {
            if (evento.status === 'inativo' || isEventPast(evento.data)) {
                inactiveEvents.push(evento);
                if (isEventPast(evento.data) && evento.status !== 'inativo') {
                    updateEventStatus(evento.id, 'inativo');
                }
            } else {
                activeEvents.push(evento);
            }
        });

        const activeTableBody = document.getElementById('eventsTable');
        activeTableBody.innerHTML = activeEvents.map(evento => `
            <tr>
                <td>${evento.titulo}</td>
                <td>${new Date(evento.data).toLocaleString()}</td>
                <td>${evento.categoria}</td>
                <td>${evento.vagas}</td>
                <td>R$ ${evento.preco}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editEvent('${evento.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteEvent('${evento.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        const inactiveTableBody = document.getElementById('inactiveEventsTable');
        inactiveTableBody.innerHTML = inactiveEvents.map(evento => `
            <tr>
                <td>${evento.titulo}</td>
                <td>${new Date(evento.data).toLocaleString()}</td>
                <td>${evento.categoria}</td>
                <td>${evento.vagas}</td>
                <td>R$ ${evento.preco}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editEvent('${evento.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteEvent('${evento.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

    } catch (error) {
        console.error('Erro ao carregar eventos:', error);
    }
}

async function updateEventStatus(eventId, status) {
    try {
        const response = await fetch(`http://localhost:3000/eventos/${eventId}`);
        const event = await response.json();
        
        await fetch(`http://localhost:3000/eventos/${eventId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...event,
                status: status
            })
        });
    } catch (error) {
        console.error('Erro ao atualizar status do evento:', error);
    }
}

setInterval(() => {
    loadEvents();
}, 60000);

document.addEventListener('DOMContentLoaded', loadEvents);

async function editEvent(id) {
    try {
        const response = await fetch(`${API_URL}/eventos/${id}`);
        const event = await response.json();
        
        document.getElementById('eventId').value = event.id;
        document.getElementById('titulo').value = event.titulo;
        document.getElementById('data').value = new Date(event.data).toISOString().slice(0, 16);
        document.getElementById('descricao').value = event.descricao;
        document.getElementById('categoria').value = event.categoria;
        document.getElementById('local').value = event.local;
        document.getElementById('localmapa').value = event.localmapa;
        document.getElementById('vagas').value = event.vagas;
        document.getElementById('preco').value = event.preco;
        document.getElementById('status').value = event.status || 'ativo';
        imagemAtual = event.imagem || ''; 

        mostrarImagemAtual(event.imagem);
    } catch (error) {
        console.error('Error loading event for edit:', error);
        alert('Erro ao carregar evento para edição: ' + error.message);
    }
}

function mostrarImagemAtual(url) {
    let info = document.getElementById('imagem-info');
    if (!info) {
        info = document.createElement('div');
        info.id = 'imagem-info';
        info.style.fontSize = '0.95rem';
        info.style.color = '#aaa';
        info.style.margin = '8px 0 0 0';
        document.getElementById('imagem').insertAdjacentElement('afterend', info);
    }
    if (url) {
        const nomeArquivo = url.split('/').pop();
        info.textContent = `Arquivo atual: ${nomeArquivo}`;
        info.style.display = 'block';
    } else {
        info.textContent = '';
        info.style.display = 'none';
    }
}

async function deleteEvent(id) {
    if (confirm('Tem certeza que deseja excluir este evento?')) {
        try {
            const response = await fetch(`${API_URL}/eventos/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            alert('Evento excluído com sucesso!');
            loadEvents();
        } catch (error) {
            console.error('Error deleting event:', error);
            alert('Erro ao excluir evento: ' + error.message);
        }
    }
}

function clearForm() {
    eventForm.reset();
    document.getElementById('eventId').value = '';
    imagemAtual = '';
    mostrarImagemAtual('');
}