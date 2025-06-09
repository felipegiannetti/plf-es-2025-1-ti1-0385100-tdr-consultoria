document.addEventListener('DOMContentLoaded', function () {
    // Pega o ID do evento pela query string (?id=...)
    const urlParams = new URLSearchParams(window.location.search);
    const eventoId = urlParams.get('id');

    // Exibe o formulário de avaliação só se houver eventoId
    const avaliacaoContainer = document.getElementById('avaliacao-container');
    if (!eventoId) {
        avaliacaoContainer.innerHTML = "<div class='alert alert-danger'>Evento não identificado.</div>";
        return;
    }

    // Lógica das estrelas
    let notaSelecionada = 0;
    document.querySelectorAll('#estrelas .estrela').forEach(estrela => {
        estrela.addEventListener('click', () => {
            notaSelecionada = estrela.dataset.value;
            document.querySelectorAll('#estrelas .estrela').forEach(e => e.classList.remove('selecionada'));
            for (let i = 0; i < notaSelecionada; i++) {
                document.querySelectorAll('#estrelas .estrela')[i].classList.add('selecionada');
            }
        });
    });

    // Enviar avaliação
    document.getElementById('enviar-avaliacao').addEventListener('click', () => {
        const nome = document.getElementById('nome').value.trim();
        const comentario = document.getElementById('comentario').value.trim();

        if (!nome || notaSelecionada == 0 || comentario === '') {
            alert("Por favor, preencha seu nome, selecione uma nota e escreva um comentário.");
            return;
        }

        const avaliacao = {
            eventoId: parseInt(eventoId),
            nome: nome,
            nota: parseInt(notaSelecionada),
            comentario: comentario
        };

        fetch('http://127.0.0.1:3000/avaliacoes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(avaliacao)
        })
        .then(res => {
            if (res.ok) {
                alert("Avaliação enviada com sucesso!");
                document.getElementById('comentario').value = '';
                document.getElementById('nome').value = '';
                notaSelecionada = 0;
                document.querySelectorAll('#estrelas .estrela').forEach(e => e.classList.remove('selecionada'));
                carregarAvaliacoes(); // Atualiza lista de avaliações
            } else {
                alert("Erro ao enviar.");
            }
        })
        .catch(() => alert("Erro ao conectar com o servidor."));
    });

    // Exibir avaliações já feitas para este evento
    function carregarAvaliacoes() {
        fetch(`http://127.0.0.1:3000/avaliacoes?eventoId=${eventoId}`)
            .then(res => res.json())
            .then(avaliacoes => {
                const lista = document.getElementById('avaliacoes-lista');
                if (!avaliacoes.length) {
                    lista.innerHTML = "<p class='text-muted'>Nenhuma avaliação ainda.</p>";
                    return;
                }
                lista.innerHTML = "<h3>Avaliações do evento</h3>" + avaliacoes.map(av => `
                    <div class="card mb-2">
                        <div class="card-body">
                            <div>
                                <span style="color:gold">${'★'.repeat(av.nota)}${'☆'.repeat(5-av.nota)}</span>
                                <span>(${av.nota}.0)</span>
                            </div>
                            <strong>${av.nome ? av.nome : 'Anônimo'}</strong>
                            <p class="mb-0">${av.comentario}</p>
                        </div>
                    </div>
                `).join('');
            });
    }

    carregarAvaliacoes();
});

