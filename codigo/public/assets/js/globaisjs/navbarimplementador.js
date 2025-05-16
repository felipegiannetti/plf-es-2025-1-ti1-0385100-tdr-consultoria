document.addEventListener('DOMContentLoaded', () => {
    implementNavbar();
    addNavbarStyles();
});

function addNavbarStyles() {
    if (!document.querySelector('link[href*="navbar.css"]')) {
        const head = document.head;
        const customCss = document.createElement('link');
        customCss.rel = 'stylesheet';
        customCss.href = '../../assets/css/navbar.css';
        head.appendChild(customCss);
    }
}

function implementNavbar() {
    const navbarContainer = document.getElementById('navbarimplementador');
    if (!navbarContainer) {
        console.error('Elemento com ID "navbarimplementador" não encontrado');
        return;
    }

    navbarContainer.innerHTML = `
        <nav class="navbar navbar-expand-lg navbar-light bg-navbar fixed-top">
            <a class="navbar-brand distanciastart" href="../../index.html">
                TDR<span style="color: orange;">Consultoria</span>
            </a>
            <button class="navbar-toggler me-4" type="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#navbarNavAltMarkup" 
                    aria-controls="navbarNavAltMarkup" 
                    aria-expanded="false" 
                    aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
                <div class="navbar-nav d-flex container justify-content-end distanciaend">
                    <a class="nav-item nav-link" href="../../index.html">Home</a>
                    <a class="nav-item nav-link" href="../eventos/exibicaoeventos.html">Eventos</a>
                    <a class="nav-item nav-link" href="../contato/contato.html">Contato</a>
                </div>
            </div>
        </nav>
    `;

    // Adiciona classe 'active' ao link da página atual
    const currentPage = window.location.pathname;
    const navLinks = navbarContainer.getElementsByClassName('nav-link');
    
    Array.from(navLinks).forEach(link => {
        if (currentPage.includes(link.getAttribute('href'))) {
            link.classList.add('active');
        }
    });
}