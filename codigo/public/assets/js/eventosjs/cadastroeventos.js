const API_URL = 'http://localhost:3000';

const eventForm = document.getElementById('eventForm');
const eventsTable = document.getElementById('eventsTable');

let imagemAtual = ''; // Variável global para guardar a imagem atual ao editar

// Load events when page loads
document.addEventListener('DOMContentLoaded', loadEvents);

// Upload image
async function uploadImagem(file) {
    const formData = new FormData();
    formData.append('imagem', file);

    const response = await fetch('http://localhost:4000/upload', {
        method: 'POST',
        body: formData
    });
    if (!response.ok) throw new Error('Falha no upload da imagem');
    return (await response.json()).imageUrl;
}

// Form submit handler
eventForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    let imageUrl = imagemAtual; // Usa a imagem atual por padrão
    const fileInput = document.getElementById('imagem');
    if (fileInput.files && fileInput.files[0]) {
        imageUrl = await uploadImagem(fileInput.files[0]);
    }

    const eventData = {
        id: document.getElementById('eventId').value || String(Date.now()),
        titulo: document.getElementById('titulo').value,
        data: new Date(document.getElementById('data').value).toISOString(),
        descricao: document.getElementById('descricao').value,
        categoria: document.getElementById('categoria').value,
        local: document.getElementById('local').value,
        localmapa: document.getElementById('localmapa').value,
        imagem: imageUrl,
        vagas: parseInt(document.getElementById('vagas').value),
        preco: parseFloat(document.getElementById('preco').value)
    };

    try {
        const isEditing = document.getElementById('eventId').value;
        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing ? `${API_URL}/eventos/${eventData.id}` : `${API_URL}/eventos`;

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

        alert(isEditing ? 'Evento atualizado com sucesso!' : 'Evento criado com sucesso!');
        clearForm();
        loadEvents();
    } catch (error) {
        console.error('Error:', error);
        alert('Erro ao salvar evento: ' + error.message);
    }
});

// Load events from db.json
async function loadEvents() {
    try {
        const response = await fetch(`${API_URL}/eventos`);
        const events = await response.json();
        
        eventsTable.innerHTML = events.map(event => `
            <tr>
                <td>${event.titulo}</td>
                <td>${new Date(event.data).toLocaleDateString('pt-BR')}</td>
                <td>${event.categoria}</td>
                <td>${event.vagas}</td>
                <td>R$ ${event.preco.toFixed(2)}</td>
                <td>
                    <button onclick="editEvent('${event.id}')" class="btn btn-sm btn-warning">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteEvent('${event.id}')" class="btn btn-sm btn-danger">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading events:', error);
        alert('Erro ao carregar eventos: ' + error.message);
    }
}

// Edit event
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
        imagemAtual = event.imagem || ''; // Salva a imagem atual

        // Exibe a imagem atual ao editar
        mostrarImagemAtual(event.imagem);
    } catch (error) {
        console.error('Error loading event for edit:', error);
        alert('Erro ao carregar evento para edição: ' + error.message);
    }
}

// Função para mostrar a imagem atual ao editar
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
        // Extrai apenas o nome do arquivo do caminho
        const nomeArquivo = url.split('/').pop();
        info.textContent = `Arquivo atual: ${nomeArquivo}`;
        info.style.display = 'block';
    } else {
        info.textContent = '';
        info.style.display = 'none';
    }
}

// Delete event
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

// Clear form
function clearForm() {
    eventForm.reset();
    document.getElementById('eventId').value = '';
    imagemAtual = '';
    mostrarImagemAtual('');
}