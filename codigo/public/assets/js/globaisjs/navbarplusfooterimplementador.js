document.addEventListener('DOMContentLoaded', () => {
    implementNavbar();
    implementFooter();
    addStyles();
});

function addStyles() {
    const head = document.head;
    const currentPath = window.location.pathname;
    const isIndex = currentPath.includes('index.html') || currentPath.endsWith('/');
    const basePath = isIndex ? 'public/assets/css/' : '../../assets/css/';

    if (!document.querySelector('link[href*="navbar.css"]')) {
        const navbarCss = document.createElement('link');
        navbarCss.rel = 'stylesheet';
        navbarCss.href = `${basePath}navbar.css`;
        head.appendChild(navbarCss);
    }

    if (!document.querySelector('link[href*="footer.css"]')) {
        const footerCss = document.createElement('link');
        footerCss.rel = 'stylesheet';
        footerCss.href = `${basePath}footer.css`;
        head.appendChild(footerCss);
    }

    if (!document.querySelector('script[src*="bootstrap.bundle.min.js"]')) {
        const bootstrapJS = document.createElement('script');
        bootstrapJS.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/js/bootstrap.bundle.min.js';
        document.body.appendChild(bootstrapJS);
    }
}

function implementNavbar() {
    const navbarContainer = document.getElementById('navbarimplementador');
    if (!navbarContainer) {
        console.error('Elemento com ID "navbarimplementador" não encontrado');
        return;
    }

    const currentPath = window.location.pathname;
    const isIndex = currentPath.includes('index.html') || currentPath.endsWith('/');
    

    const paths = {
        index: {
            home: '',
            eventos: 'public/modulos/eventos/exibicaoeventos.html',
            cadastroEventos: 'public/modulos/eventos/cadastroEventos.html',
            contato: 'public/modulos/contato/contato.html'
        },
        other: {
            home: '../../../index.html',
            eventos: 'exibicaoeventos.html',
            cadastroEventos: 'cadastroEventos.html',
            contato: '../contato/contato.html'
        }
    };

    const currentPaths = isIndex ? paths.index : paths.other;

    navbarContainer.innerHTML = `
        <nav class="navbar navbar-expand-lg navbar-light bg-navbar fixed-top">
            <a class="navbar-brand distanciastart" href="${currentPaths.home}">
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
                    <a class="nav-item nav-link" href="${currentPaths.home}">Home</a>
                    <div class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            Eventos
                        </a>
                        <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                            <li><a class="dropdown-item" href="${currentPaths.eventos}">Eventos Principais</a></li>
                            <li><a class="dropdown-item" href="${currentPaths.cadastroEventos}">Cadastro de Eventos</a></li>
                        </ul>
                    </div>
                    <a class="nav-item nav-link" href="${currentPaths.contato}">Contato</a>
                </div>
            </div>
        </nav>
    `;

    const currentPage = window.location.pathname;
    const navLinks = navbarContainer.getElementsByClassName('nav-link');

    Array.from(navLinks).forEach(link => {
        if (currentPage.includes(link.getAttribute('href'))) {
            link.classList.add('active');
        }
    });
}

function implementFooter() {
    const footerContainer = document.getElementById('footerimplementador');
    if (!footerContainer) {
        console.error('Elemento com ID "footerimplementador" não encontrado');
        return;
    }

    const currentPath = window.location.pathname;
    const isIndex = currentPath.includes('index.html') || currentPath.endsWith('/');

    const paths = {
        index: {
            home: '',
            eventos: 'public/modulos/eventos/exibicaoeventos.html',
            contato: 'public/modulos/contato/contato.html'
        },
        other: {
            home: '../../../index.html',
            eventos: 'exibicaoeventos.html',
            contato: '../contato/contato.html'
        }
    };

    const currentPaths = isIndex ? paths.index : paths.other;


    const footerHtml = `
        <footer class="bg-footer py-4">
            <div class="container">
                <div class="row">
                    <div class="col-md-4 mb-3">
                        <h5 class="mb-3">TDR Consultoria</h5>
                        <p>Transformando ideias em resultados através de soluções inovadoras e personalizadas.</p>
                    </div>
                    <div class="col-md-4 mb-3">
                        <h5 class="mb-3">Links Rápidos</h5>
                        <ul class="list-unstyled">
                            <li><a href="${currentPaths.home}">Home</a></li>
                            <li><a href="${currentPaths.eventos}">Eventos</a></li>
                            <li><a href="${currentPaths.contato}">Contato</a></li>
                        </ul>
                    </div>
                    <div class="col-md-4 mb-3">
                        <h5 class="mb-3">Contato</h5>
                        <ul class="list-unstyled">
                            <li><i class="fas fa-envelope me-2"></i>contato@tdrconsultoria.com</li>
                            <li><i class="fas fa-phone me-2"></i>(31) 9999-9999</li>
                            <li><i class="fas fa-map-marker-alt me-2"></i>Belo Horizonte, MG</li>
                        </ul>
                    </div>
                </div>
                <hr class="my-4">
                <div class="text-center">
                    <p class="mb-0">&copy; 2025 TDR Consultoria. Todos os direitos reservados.</p>
                </div>
            </div>
        </footer>
    `;
    
    footerContainer.innerHTML = footerHtml;
}