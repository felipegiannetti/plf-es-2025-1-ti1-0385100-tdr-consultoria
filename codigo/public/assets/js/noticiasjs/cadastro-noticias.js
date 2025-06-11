document.getElementById('noticiaForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const noticia = {
        titulo: document.getElementById('titulo').value,
        descricao: document.getElementById('descricao').value,
        texto_completo: document.getElementById('texto_completo').value,
        categoria: document.getElementById('categoria').value,
        imagem: document.getElementById('imagem').value,
        data: new Date().toISOString().split('T')[0]
    };

    try {
        const response = await fetch('http://localhost:3000/noticias', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(noticia)
        });

        if (response.ok) {
            alert('Notícia cadastrada com sucesso!');
            window.location.href = 'noticias.html';
        } else {
            alert('Erro ao cadastrar notícia');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao cadastrar notícia');
    }
});

async function cadastrarNoticia(event) {
    event.preventDefault();

    const form = document.getElementById('form-cadastro');
    const formData = new FormData(form);

    const noticiaData = {
        titulo: formData.get('titulo'),
        subtitulo: formData.get('subtitulo'),
        autor: formData.get('autor'),
        data: new Date().toISOString(),
        tema: formData.get('tema'),
        descricao: formData.get('descricao'),
        imagem: formData.get('imagem')
    };

    try {
        const response = await fetch(`${API_URL}/noticias`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(noticiaData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const novaNoticia = await response.json();
        
        // Broadcast a custom event when a new article is added
        const event = new CustomEvent('noticiaAdicionada', { detail: novaNoticia });
        window.dispatchEvent(event);

        // Redirect to news page
        window.location.href = '../noticias/noticias.html';

    } catch (error) {
        console.error('Erro ao cadastrar notícia:', error);
        alert('Erro ao cadastrar notícia. Por favor, tente novamente.');
    }
}