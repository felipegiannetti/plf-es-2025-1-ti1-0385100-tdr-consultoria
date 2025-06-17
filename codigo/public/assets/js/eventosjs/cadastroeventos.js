const API_URL = 'http://localhost:3000';

// Ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    loadEvents();
    document.getElementById('eventForm').addEventListener('submit', handleSubmit);
});

// Enviar o formulário
async function handleSubmit(e) {
    e.preventDefault();

    let imageUrl = '';
    const fileInput = document.getElementById('imagem');

    if (fileInput.files && fileInput.files.length > 0) {
        imageUrl = await uploadImagem(fileInput.files[0]);

        if (!imageUrl) {
            alert('Falha no upload da imagem. Evento não será salvo.');
            return;
        }
    }

    const eventData = {
        id: document.getElementById('eventId').value || String(Date.now()),
        titulo: document.getElementById('titulo').value,
        data: new Date(document.getElementById('data').value).toISOString(),
        descricao: document.getElementById('descricao').value,
        categoria: document.getElementById('categoria').value,
        local: document.getElementById('local').value,
        localmapa: document.getElementById('localmapa').value,
        imagem: imageUrl || document.getElementById('imagem').getAttribute('data-current') || '',
        vagas: parseInt(document.getElementById('vagas').value),
        preco: parseFloat(document.getElementById('preco').value),
        status: document.getElementById('status').value
    };

    const isEditing = document.getElementById('eventId').value !== '';
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `${API_URL}/eventos/${eventData.id}` : `${API_URL}/eventos`;

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData)
        });

        if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);

        alert(isEditing ? 'Evento atualizado com sucesso!' : 'Evento criado com sucesso!');
        clearForm();
        loadEvents();
    } catch (error) {
        console.error('Erro ao salvar evento:', error);
        alert('Erro ao salvar evento: ' + error.message);
    }
}

// Upload de imagem
async function uploadImagem(file) {
    const formData = new FormData();
    formData.append('imagem', file);

    try {
        const response = await fetch('http://localhost:4000/upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error(`Erro no upload da imagem: ${response.status}`);

        const data = await response.json();
        console.log('Imagem enviada com sucesso:', data.imageUrl);
        return data.imageUrl;
    } catch (error) {
        console.error('Erro ao fazer upload da imagem:', error);
        return '';
    }
}

// Carregar eventos
async function loadEvents() {
    try {
        const response = await fetch(`${API_URL}/eventos`);
        const eventos = await response.json();

        const activeEvents = eventos.filter(e => e.status === 'ativo');
        const inactiveEvents = eventos.filter(e => e.status === 'inativo');

        renderTable('activeEventsTable', activeEvents);
        renderTable('inactiveEventsTable', inactiveEvents, true);
    } catch (error) {
        console.error('Erro ao carregar eventos:', error);
    }
}

function renderTable(tableId, events, isInactive = false) {
    const tbody = document.getElementById(tableId);
    tbody.innerHTML = events.map(event => `
        <tr>
            <td>${event.titulo}</td>
            <td>${new Date(event.data).toLocaleDateString('pt-BR')}</td>
            <td>${event.categoria}</td>
            <td>${event.vagas}</td>
            <td>R$ ${parseFloat(event.preco).toFixed(2)}</td>
            <td>
                <img src="http://localhost:4000/${event.imagem}" alt="${event.titulo}" style="max-width: 80px;"><br>
                <div class="btn-group mt-1" role="group">
                    <button class="btn btn-sm btn-primary" onclick="editEvent('${event.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-danger ms-2" onclick="deleteEvent('${event.id}')"><i class="fas fa-trash"></i></button>
                    <button class="btn btn-sm ${isInactive ? 'btn-success' : 'btn-warning'} ms-2" onclick="toggleEventStatus('${event.id}')"><i class="fas fa-power-off"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Alternar status do evento
async function toggleEventStatus(id) {
    try {
        const res = await fetch(`${API_URL}/eventos/${id}`);
        const event = await res.json();
        event.status = event.status === 'ativo' ? 'inativo' : 'ativo';

        await fetch(`${API_URL}/eventos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event)
        });

        loadEvents();
    } catch (error) {
        console.error('Erro ao alterar status:', error);
    }
}

// Editar evento
async function editEvent(id) {
    try {
        const response = await fetch(`${API_URL}/eventos/${id}`);
        const event = await response.json();

        document.getElementById('eventId').value = event.id;
        document.getElementById('titulo').value = event.titulo;
        document.getElementById('data').value = event.data.slice(0, 16);
        document.getElementById('descricao').value = event.descricao;
        document.getElementById('categoria').value = event.categoria;
        document.getElementById('vagas').value = event.vagas;
        document.getElementById('preco').value = event.preco;
        document.getElementById('local').value = event.local;
        document.getElementById('localmapa').value = event.localmapa;
        document.getElementById('status').value = event.status;

        // Preservar imagem
        document.getElementById('imagem').value = '';
        document.getElementById('imagem').setAttribute('data-current', event.imagem);

        // Exibir nome da imagem atual
        const imagemInfo = document.getElementById('imagem-info');
        const nomeImagem = event.imagem.split('/').pop();
        imagemInfo.textContent = `Imagem atual: ${nomeImagem}`;
    } catch (error) {
        console.error('Erro ao carregar evento:', error);
    }
}

// Excluir evento
async function deleteEvent(id) {
    if (confirm('Tem certeza que deseja excluir este evento?')) {
        try {
            await fetch(`${API_URL}/eventos/${id}`, { method: 'DELETE' });
            loadEvents();
        } catch (error) {
            console.error('Erro ao excluir evento:', error);
        }
    }
}

// Limpar formulário
function clearForm() {
    document.getElementById('eventId').value = '';
    document.getElementById('titulo').value = '';
    document.getElementById('data').value = '';
    document.getElementById('descricao').value = '';
    document.getElementById('categoria').value = '';
    document.getElementById('vagas').value = '';
    document.getElementById('preco').value = '';
    document.getElementById('local').value = '';
    document.getElementById('localmapa').value = '';
    document.getElementById('imagem').value = '';
    document.getElementById('imagem').removeAttribute('data-current');
    document.getElementById('imagem-info').textContent = '';
    document.getElementById('status').value = 'ativo';

    const inputs = document.querySelectorAll('#eventForm .form-control');
    inputs.forEach(input => input.classList.remove('is-valid', 'is-invalid'));
}
