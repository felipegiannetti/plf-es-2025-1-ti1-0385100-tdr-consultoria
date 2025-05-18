document.addEventListener('DOMContentLoaded', () => {
    loadEvents();
});

//Sistema que carrega o FAQ
async function loadEvents() {
    try {
        
        const containerFAQ = document.getElementById('FAQ');
        containerFAQ.innerHTML = `
            <div class="faq-section">
            <h2>PRODUCT INFO</h2>
            <div class="faq-item">
                <h3>CAN I BUY LIQUID DEATH WHOLESALE? <span class="plus">+</span></h3>
                <p>Yes, Liquid Death offers wholesale options. Contact their sales team for more information.</p>
            </div>
            <div class="faq-item">
                <h3>WHERE CAN I BUY LIQUID DEATH? <span class="plus">+</span></h3>
                <p>Liquid Death is available at major retailers and online stores.</p>
            </div>
            <div class="faq-item">
                <h3>WHERE CAN I BUY LIQUID DEATH ICED TEA? <span class="plus">+</span></h3>
                <p>You can find Liquid Death Iced Tea at select stores and online platforms.</p>
            </div>
            <div class="faq-item">
                <h3>ARE YOUR CANS RECYCLABLE? <span class="plus">+</span></h3>
                <p>Yes, all Liquid Death cans are 100% recyclable.</p>
            </div>
            <div class="faq-item">
                <h3>IS THERE CAFFEINE IN LIQUID DEATH? <span class="plus">+</span></h3>
                <p>No, Liquid Death is a non-caffeinated beverage.</p>
            </div>
            <div class="faq-item">
                <h3>IS LIQUID DEATH SAFE FOR CHILDREN? <span class="plus">+</span></h3>
                <p>Yes, Liquid Death is just water and is safe for all ages.</p>
            </div>
        </div>
        `;

    } catch (error) {
        console.error('Erro ao carregar FAQ:', error);
    }
}