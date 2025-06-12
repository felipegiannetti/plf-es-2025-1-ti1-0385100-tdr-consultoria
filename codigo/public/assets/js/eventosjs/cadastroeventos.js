const API_URL = 'http://localhost:3000';

// Load events when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadEvents();
    document.getElementById('eventForm').addEventListener('submit', handleSubmit);
});

async function loadEvents() {
    try {
        const response = await fetch(`${API_URL}/eventos`);
        const eventos = await response.json();
        
        // Separate active and inactive events
        const activeEvents = eventos.filter(event => event.status === 'ativo');
        const inactiveEvents = eventos.filter(event => event.status === 'inativo');
        
        // Update active events table
        const activeTableBody = document.getElementById('activeEventsTable');
        activeTableBody.innerHTML = activeEvents.map(event => `
            <tr>
                <td>${event.titulo}</td>
                <td>${new Date(event.data).toLocaleDateString('pt-BR')}</td>
                <td>${event.categoria}</td>
                <td>${event.vagas}</td>
                <td>R$ ${parseFloat(event.preco).toFixed(2)}</td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-primary" onclick="editEvent('${event.id}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger ms-2" onclick="deleteEvent('${event.id}')" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn btn-sm btn-warning ms-2" onclick="toggleEventStatus('${event.id}')" title="Desativar">
                            <i class="fas fa-power-off"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Update inactive events table
        const inactiveTableBody = document.getElementById('inactiveEventsTable');
        inactiveTableBody.innerHTML = inactiveEvents.map(event => `
            <tr>
                <td>${event.titulo}</td>
                <td>${new Date(event.data).toLocaleDateString('pt-BR')}</td>
                <td>${event.categoria}</td>
                <td>${event.vagas}</td>
                <td>R$ ${parseFloat(event.preco).toFixed(2)}</td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-primary" onclick="editEvent('${event.id}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger ms-2" onclick="deleteEvent('${event.id}')" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn btn-sm btn-success ms-2" onclick="toggleEventStatus('${event.id}')" title="Ativar">
                            <i class="fas fa-power-off"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Erro ao carregar eventos:', error);
    }
}

// Add these helper functions for the actions
async function toggleEventStatus(id) {
    try {
        const response = await fetch(`${API_URL}/eventos/${id}`);
        const event = await response.json();
        
        event.status = event.status === 'ativo' ? 'inativo' : 'ativo';
        
        await fetch(`${API_URL}/eventos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(event)
        });
        
        loadEvents();
    } catch (error) {
        console.error('Erro ao alterar status:', error);
    }
}

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
    } catch (error) {
        console.error('Erro ao carregar evento:', error);
    }
}

async function deleteEvent(id) {
    if (confirm('Tem certeza que deseja excluir este evento?')) {
        try {
            await fetch(`${API_URL}/eventos/${id}`, {
                method: 'DELETE'
            });
            loadEvents();
        } catch (error) {
            console.error('Erro ao excluir evento:', error);
        }
    }
}

function clearForm() {
    // Reset hidden ID field
    document.getElementById('eventId').value = '';
    
    // Reset all form fields
    document.getElementById('titulo').value = '';
    document.getElementById('data').value = '';
    document.getElementById('descricao').value = '';
    document.getElementById('categoria').value = '';
    document.getElementById('vagas').value = '';
    document.getElementById('preco').value = '';
    document.getElementById('local').value = '';
    document.getElementById('localmapa').value = '';
    document.getElementById('imagem').value = '';
    document.getElementById('status').value = 'ativo';

    // Remove any validation classes/styles
    const form = document.getElementById('eventForm');
    const inputs = form.querySelectorAll('.form-control');
    inputs.forEach(input => {
        input.classList.remove('is-valid', 'is-invalid');
    });

    // Optional: Focus on first field
    document.getElementById('titulo').focus();
}