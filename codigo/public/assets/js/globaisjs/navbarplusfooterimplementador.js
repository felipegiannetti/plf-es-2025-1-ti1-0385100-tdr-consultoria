document.addEventListener('DOMContentLoaded', async () => {
    await loadBootstrap();
    await new Promise(resolve => setTimeout(resolve, 100));
    addStyles();
    implementNavbar();
    implementFooter();

    const dropdownElementList = document.querySelectorAll('.dropdown-toggle');
    dropdownElementList.forEach(dropdownToggleEl => {
        new bootstrap.Dropdown(dropdownToggleEl, {
            offset: [0, 2],
            boundary: 'viewport'
        });
    });

    // document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
    //     link.addEventListener('click', () => {
    //         const navbarCollapse = document.getElementById('navbarNav');
    //         if (window.innerWidth < 992 && navbarCollapse.classList.contains('show')) {
    //             const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
    //             if (bsCollapse) bsCollapse.hide();
    //         }
    //     });
    // });  BUG DE CLICAR E FECHAR
});

async function loadBootstrap() {
    if (!document.querySelector('link[href*="bootstrap.min.css"]')) {
        const bootstrapCSS = document.createElement('link');
        bootstrapCSS.rel = 'stylesheet';
        bootstrapCSS.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css';
        document.head.appendChild(bootstrapCSS);
    }

    if (!document.querySelector('script[src*="bootstrap.bundle.min.js"]')) {
        return new Promise(resolve => {
            const bootstrapJS = document.createElement('script');
            bootstrapJS.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/js/bootstrap.bundle.min.js';
            bootstrapJS.onload = resolve;
            document.body.appendChild(bootstrapJS);
        });
    }
}

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
            noticias: 'public/modulos/noticias/noticias.html',
            cadastroNoticias: 'public/modulos/noticias/cadastroNoticias.html',
            quizzes: 'public/modulos/formulario/exibiformulario.html',
        },
        other: {
            home: '../../../index.html',
            eventos: '../eventos/exibicaoeventos.html',  // Fixed path for subfolders
            cadastroEventos: 'cadastroEventos.html',
            noticias: '../noticias/noticias.html',
            cadastroNoticias: 'cadastroNoticias.html',
            quizzes: '../formulario/exibiformulario.html',
        }
    };

    const currentPaths = isIndex ? paths.index : paths.other;
    const logoPath = isIndex ? 'public/assets/img/logo.png' : '../../assets/img/logo.png';

    navbarContainer.innerHTML = `
        <nav class="navbar navbar-expand-lg navbar-light bg-navbar fixed-top" id= "navbar">
            <div class="container">
                <a href="${currentPaths.home}"><img src="${logoPath}" alt="Logo" class="navbar-logo img-fluid mb-3" style="max-height: 60px; width: auto;"></a>
                <a class="navbar-brand" href="${currentPaths.home}" style="font-size: 1.3rem;">
                    TDR<span style="color: #cc0000;"> Corporative</span>
                </a>
                <button class="navbar-toggler" type="button" 
                        data-bs-toggle="collapse" 
                        data-bs-target="#navbarNav" 
                        aria-controls="navbarNav" 
                        aria-expanded="false" 
                        aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav ms-auto">
                        <li class="nav-item">
                            <a class="nav-link" href="${currentPaths.home}">Home</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="${currentPaths.quizzes}">Quizzes</a>
                        </li>
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" 
                               href="#" 
                               id="navbarDropdown"
                               role="button" 
                               data-bs-toggle="dropdown" 
                               aria-expanded="false">
                                Eventos
                            </a>
                            <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                                <li><a class="dropdown-item" href="${currentPaths.eventos}">Eventos Principais</a></li>
                                <li><a class="dropdown-item" href="${currentPaths.cadastroEventos}">Cadastro de Eventos</a></li>
                            </ul>
                        </li>
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" 
                               href="#" 
                               id="noticiasDropdown"
                               role="button" 
                               data-bs-toggle="dropdown" 
                               aria-expanded="false">
                                Notícias
                            </a>
                            <ul class="dropdown-menu" aria-labelledby="noticiasDropdown">
                                <li><a class="dropdown-item" href="${currentPaths.noticias}">Últimas Notícias</a></li>
                                <li><a class="dropdown-item" href="${currentPaths.cadastroNoticias}">Cadastro de Notícias</a></li>
                            </ul>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" onclick="toggleContatoCard(true); return false;">Contato</a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    `;

    // Marca a página ativa no menu
    const currentPage = window.location.pathname;
    const navLinks = navbarContainer.getElementsByClassName('nav-link');
    Array.from(navLinks).forEach(link => {
        if (currentPage.includes(link.getAttribute('href')) && link.getAttribute('href') !== '#') {
            link.classList.add('active');
        }
    });

    if (!document.getElementById('card-contato')) {
        const contactCard = document.createElement('div');
        contactCard.id = 'card-contato';
        contactCard.className = 'card-contato';
        contactCard.style.display = 'none';
        contactCard.innerHTML = `
            <div class="card-header d-flex justify-content-between align-items-center">
                <h3 class="mb-0">Informações de Contato</h3>
                <button type="button" class="btn-close" onclick="toggleContatoCard(false)"></button>
            </div>
            <div class="card-body">
                <p><i class="fas fa-envelope me-2"></i><strong>Email:</strong> tdrconsultoria@gmail.com</p>
                <p><i class="fas fa-phone me-2"></i><strong>Telefone:</strong> (32) 98431-5193</p>
                <p><i class="fas fa-clock me-2"></i><strong>Funcionamento:</strong> Segunda à sexta de 11h às 19h</p>
            </div>
        `;
        document.body.appendChild(contactCard);

        const overlay = document.createElement('div');
        overlay.id = 'overlay';
        overlay.className = 'overlay';
        overlay.addEventListener('click', () => toggleContatoCard(false));
        document.body.appendChild(overlay);
    }
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
    const logoPath = isIndex ? 'public/assets/img/logo.png' : '../../assets/img/logo.png';

    const footerHtml = `
        <footer class="bg-footer py-5 text-light">
            <div class="container position-relative">
                <div class="row text-center text-md-start">
                    <div class="col-md-4 mb-4">
                        <h5 class="mb-3">TDR Consultoria</h5>
                        <p class="text-dark">Transformando ideias em resultados com soluções inovadoras e personalizadas.</p>
                    </div>
                    <div class="col-md-4 mb-4">
                        <h5 class="mb-3">Links Rápidos</h5>
                        <ul class="list-unstyled">
                            <li><a href="${currentPaths.home}"><i class="fas fa-home me-2"></i>Home</a></li>
                            <li><a href="${currentPaths.eventos}"><i class="fas fa-calendar-alt me-2"></i>Eventos</a></li>
                        </ul>
                    </div>
                    <div class="col-md-4 mb-4">
                        <h5 class="mb-3">Contato</h5>
                        <ul class="list-unstyled text-dark">
                            <li><i class="fas fa-envelope me-2"></i>contato@tdrconsultoria.com</li>
                            <li><i class="fas fa-phone me-2"></i>(31) 9999-9999</li>
                            <li><i class="fas fa-map-marker-alt me-2"></i>Belo Horizonte, MG</li>
                        </ul>
                    </div>
                </div>
            <hr class="my-4">
            <div class="text-center small">
                <p class="mb-0 text-dark">&copy; 2025 TDR Consultoria. Todos os direitos reservados.</p>
            </div>
            <img src="${logoPath}" alt="Logo TDR" class="footer-logo footer-logo-right animate-logo">
        </div>
    </footer>
`;

    footerContainer.innerHTML = footerHtml;
}

function toggleContatoCard(show) {
    const card = document.getElementById('card-contato');
    const overlay = document.getElementById('overlay');

    if (!card || !overlay) {
        console.error('Contact card or overlay not found');
        return;
    }

    if (show) {
        card.style.display = 'block';
        overlay.style.display = 'block';
        document.body.style.overflow = 'hidden';
    } else {
        card.style.display = 'none';
        overlay.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}
