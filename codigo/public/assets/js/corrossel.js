document.addEventListener("DOMContentLoaded", function () {
    const carouselElement = document.querySelector('#carouselExampleIndicators');

    if (carouselElement) {
        const carousel = new bootstrap.Carousel(carouselElement, {
            interval: 4000,
            pause: false,
            wrap: true
        });

        carousel.cycle(); // Força o início automático

        window.addEventListener('resize', () => {
            const width = window.innerWidth;

            carousel._config.interval = width < 768 ? 5000 : 4000;
        });
    }
});
