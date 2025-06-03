document.addEventListener('DOMContentLoaded', function() {
    const flipToggles = document.querySelectorAll('.flip-toggle');
    
    flipToggles.forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.flip-card');
            card.classList.toggle('flipped');
        });
    });
});