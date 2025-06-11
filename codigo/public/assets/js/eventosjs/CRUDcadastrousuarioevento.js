const CADASTRO_API_URL = 'http://localhost:3000/cadastroDeEventos';

function displayMessage(mensagem) {
    msg = document.getElementById('msg');
    msg.innerHTML = '<div class="alert alert-warning">' + mensagem + '</div>';
}

function readCadastro(processaDados) {
    fetch(CADASTRO_API_URL)
        .then(response => response.json())
        .then(data => {
            processaDados(data);
        })
        .catch(error => {
            console.error('Erro ao ler cadastro via API JSONServer:', error);
            displayMessage("Erro ao ler cadastro");
        });
}

function createCadastro(cadastro, refreshFunction) {
    fetch(CADASTRO_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(cadastro),
    })
        .then(response => response.json())
        .then(data => {
            displayMessage("Cadastro inserido com sucesso");
            if (refreshFunction)
                refreshFunction();
        })
        .catch(error => {
            console.error('Erro ao inserir cadastro via API JSONServer:', error);
            displayMessage("Erro ao inserir cadastro");
        });
}

function updateCadastro(id, cadastro, refreshFunction) {
    fetch(`${CADASTRO_API_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(cadastro),
    })
        .then(response => response.json())
        .then(data => {
            displayMessage("Cadastro alterado com sucesso");
            if (refreshFunction)
                refreshFunction();
        })
        .catch(error => {
            console.error('Erro ao atualizar cadastro via API JSONServer:', error);
            displayMessage("Erro ao atualizar cadastro");
        });
}

function deleteCadastro(id, refreshFunction) {
    fetch(`${CADASTRO_API_URL}/${id}`, {
        method: 'DELETE',
    })
        .then(response => response.json())
        .then(data => {
            displayMessage("Cadastro removido com sucesso");
            if (refreshFunction)
                refreshFunction();
        })
        .catch(error => {
            console.error('Erro ao remover cadastro via API JSONServer:', error);
            displayMessage("Erro ao remover cadastro");
        });
}
