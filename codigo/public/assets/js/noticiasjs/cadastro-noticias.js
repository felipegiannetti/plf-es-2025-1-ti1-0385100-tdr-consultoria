document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('form-cadastro');
    
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const noticia = {
            titulo: document.getElementById('titulo').value,
            descricaoBreve: document.getElementById('descricao_breve').value,
            textoCompleto: document.getElementById('texto_completo').value,
            categoria: document.getElementById('categoria').value,
            imagem: document.getElementById('imagem').value || 'https://via.placeholder.com/350x200',
            data: new Date().toISOString(),
            autor: 'Admin' // You can add an author field to the form if needed
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
                // Dispatch event to update news list
                window.dispatchEvent(new Event('noticiaAdicionada'));
                // Redirect to news page
                window.location.href = 'noticias.html';
            } else {
                throw new Error('Erro ao cadastrar notícia');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao cadastrar notícia: ' + error.message);
        }
    });
});