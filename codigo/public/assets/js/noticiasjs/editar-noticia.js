const API_URL = '';

document.addEventListener('DOMContentLoaded', function() {
    checkAdminAccess();
    carregarDadosNoticia();

    const form = document.getElementById('form-edicao');
    form.addEventListener('submit', salvarEdicao);
});

function carregarDadosNoticia() {
    const noticiaData = JSON.parse(localStorage.getItem('editando_noticia'));
    if (!noticiaData) {
        alert('Dados da notícia não encontrados');
        window.location.href = 'noticias.html';
        return;
    }

    document.getElementById('titulo').value = noticiaData.titulo;
    document.getElementById('descricao_breve').value = noticiaData.descricaoBreve;
    document.getElementById('texto_completo').value = noticiaData.textoCompleto;
    document.getElementById('categoria').value = noticiaData.categoria;
    document.getElementById('imagem').value = noticiaData.imagem;
}

async function salvarEdicao(event) {
    event.preventDefault();
    
    const urlParams = new URLSearchParams(window.location.search);
    const noticiaId = urlParams.get('id');

    const noticiaAtualizada = {
        titulo: document.getElementById('titulo').value,
        descricaoBreve: document.getElementById('descricao_breve').value,
        textoCompleto: document.getElementById('texto_completo').value,
        categoria: document.getElementById('categoria').value,
        imagem: document.getElementById('imagem').value,
        data: new Date().toISOString(),
        autor: 'Admin'
    };

    try {
        const response = await fetch(`${API_URL}/noticias/${noticiaId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(noticiaAtualizada)
        });

        if (!response.ok) throw new Error('Erro ao atualizar notícia');

        alert('Notícia atualizada com sucesso!');
        localStorage.removeItem('editando_noticia');
        window.location.href = `noticia-detalhes.html?id=${noticiaId}`;

    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao atualizar notícia: ' + error.message);
    }
}