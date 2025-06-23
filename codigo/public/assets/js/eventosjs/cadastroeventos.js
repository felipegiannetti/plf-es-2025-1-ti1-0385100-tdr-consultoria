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

        // Simply clear form and reload events without showing alert
        clearForm();
        loadEvents();
        
    } catch (error) {
        console.error('Erro ao salvar evento:', error);
        await Swal.fire({
            title: 'Erro!',
            text: 'Erro ao salvar evento: ' + error.message,
            icon: 'error',
            background: '#222',
            color: '#fff',
            customClass: {
                popup: 'swal-custom-popup',
                confirmButton: 'swal-custom-button'
            }
        });
    }
}

// Upload de imagem
async function uploadImagem(file) {
    const formData = new FormData();
    formData.append('imagem', file);

    try {
        // Corrigindo a URL do endpoint de upload
        const response = await fetch(`${API_URL}/upload-evento`, {
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
                <img src="http://localhost:3000/${event.imagem}" alt="${event.titulo}" style="max-width: 80px;"><br>
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
        // Buscar evento
        const eventRes = await fetch(`${API_URL}/eventos/${id}`);
        const event = await eventRes.json();

        // Buscar inscrições
        const inscricoesRes = await fetch(`${API_URL}/cadastroDeEventos`);
        const inscricoes = await inscricoesRes.json();

        // Calcular número de inscritos
        const numeroInscritos = inscricoes
            .filter(inscricao => inscricao.idEvento === id)
            .reduce((total, inscricao) => total + inscricao.idUsuario.length, 0);

        // Verificar se atingiu limite de vagas
        if (numeroInscritos >= event.vagas) {
            event.status = 'inativo';
            console.log(`Evento ${event.titulo} desativado automaticamente por lotação`);
        } else {
            // Se não atingiu o limite, permite alternar normalmente
            event.status = event.status === 'ativo' ? 'inativo' : 'ativo';
        }

        // Atualizar status do evento
        await fetch(`${API_URL}/eventos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event)
        });

        // Recarregar lista de eventos
        loadEvents();
        
        // Notificar usuário
        if (numeroInscritos >= event.vagas) {
            alert('Evento foi desativado automaticamente por ter atingido o limite de vagas.');
        }
    } catch (error) {
        console.error('Erro ao alterar status:', error);
        alert('Erro ao alterar status do evento: ' + error.message);
    }
}

// Editar evento
async function editEvent(id) {
    try {
        const response = await fetch(`${API_URL}/eventos/${id}`);
        const event = await response.json();

        // Preencher formulário com os dados do evento
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

        // Tratar imagem
        document.getElementById('imagem').value = '';
        document.getElementById('imagem').setAttribute('data-current', event.imagem);
        const imagemInfo = document.getElementById('imagem-info');
        const nomeImagem = event.imagem.split('/').pop();
        imagemInfo.textContent = `Imagem atual: ${nomeImagem}`;

        // Add scroll-offset class to form if not present
        const form = document.getElementById('eventForm');
        form.classList.add('scroll-offset');

        // Scroll higher up with offset
        window.scrollTo({ 
            top: form.offsetTop - 150,
            behavior: 'smooth'
        });

        // Highlight effect
        form.classList.add('highlight-form');
        setTimeout(() => form.classList.remove('highlight-form'), 1500);

    } catch (error) {
        console.error('Erro ao carregar evento:', error);
    }
}

// Excluir evento
async function deleteEvent(id) {
    try {
        const result = await Swal.fire({
            title: 'Tem certeza?',
            text: "Esta ação não poderá ser revertida!",
            icon: 'warning',
            background: '#222',
            color: '#fff',
            showCancelButton: true,
            confirmButtonText: 'Sim, deletar!',
            cancelButtonText: 'Cancelar',
            customClass: {
                popup: 'swal-custom-popup',
                confirmButton: 'swal-custom-button',
                cancelButton: 'swal-custom-button'
            },
            buttonsStyling: true
        });

        if (result.isConfirmed) {
            const response = await fetch(`${API_URL}/eventos/${id}`, { 
                method: 'DELETE' 
            });

            if (!response.ok) throw new Error('Erro ao deletar evento');

            await Swal.fire({
                title: 'Deletado!',
                text: 'O evento foi removido com sucesso.',
                icon: 'success',
                background: '#222',
                color: '#fff',
                customClass: {
                    popup: 'swal-custom-popup',
                    confirmButton: 'swal-custom-button'
                },
                buttonsStyling: true
            });

            loadEvents();
        }
    } catch (error) {
        console.error('Erro ao excluir evento:', error);
        await Swal.fire({
            title: 'Erro!',
            text: 'Não foi possível deletar o evento.',
            icon: 'error',
            background: '#222',
            color: '#fff',
            customClass: {
                popup: 'swal-custom-popup',
                confirmButton: 'swal-custom-button'
            },
            buttonsStyling: true
        });
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
