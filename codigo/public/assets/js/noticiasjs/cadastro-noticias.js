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