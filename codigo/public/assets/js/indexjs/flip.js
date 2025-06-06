document.addEventListener('DOMContentLoaded', function() {
    // Select all cards
    const cards = document.querySelectorAll('.flip-card');
    
    cards.forEach(card => {
        // Get buttons for this card
        const detailsButton = card.querySelector('.btn-details');
        const backButton = card.querySelector('.btn-back');
        
        // Add click event for details button
        if (detailsButton) {
            detailsButton.addEventListener('click', function() {
                card.classList.add('active');
            });
        }
        
        // Add click event for back button
        if (backButton) {
            backButton.addEventListener('click', function() {
                card.classList.remove('active');
            });
        }
    });
});