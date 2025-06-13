document.addEventListener('DOMContentLoaded', function () {
  const cards = document.querySelectorAll('.flip-card');

  cards.forEach(card => {
    const detalhesBtn = card.querySelector('.btn-ver-detalhes');
    const voltarBtn = card.querySelector('.btn-voltar-card');

    if (detalhesBtn) {
      detalhesBtn.addEventListener('click', () => {
        card.classList.add('active');
      });
    }

    if (voltarBtn) {
      voltarBtn.addEventListener('click', () => {
        card.classList.remove('active');
      });
    }
  });
});
