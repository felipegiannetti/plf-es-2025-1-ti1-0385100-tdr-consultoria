let notaSelecionada = 0;

// Pega o ID do evento via query string
const urlParams = new URLSearchParams(window.location.search);
const eventoId = urlParams.get('evento');
document.getElementById('evento-id').textContent = `Evento ID: ${eventoId}`;

// Estrelas
document.querySelectorAll('.estrela').forEach(estrela => {
  estrela.addEventListener('click', () => {
    notaSelecionada = estrela.dataset.value;
    document.querySelectorAll('.estrela').forEach(e => e.classList.remove('selecionada'));
    for (let i = 0; i < notaSelecionada; i++) {
      document.querySelectorAll('.estrela')[i].classList.add('selecionada');
    }
  });
});

// Enviar avaliação
document.getElementById('enviar-avaliacao').addEventListener('click', () => {
  const comentario = document.getElementById('comentario').value.trim();

  if (notaSelecionada === 0 || comentario === '') {
    alert("Por favor, selecione uma nota e escreva um comentário.");
    return;
  }

  const avaliacao = {
    eventoId: parseInt(eventoId),
    nota: parseInt(notaSelecionada),
    comentario: comentario
  };

  // Envio com JSON Server (você pode mudar o URL conforme sua config)
  fetch('http://localhost:3000/avaliacoes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(avaliacao)
  })
  .then(res => res.ok ? alert("Avaliação enviada com sucesso!") : alert("Erro ao enviar."))
  .catch(() => alert("Erro ao conectar com o servidor."));
});
