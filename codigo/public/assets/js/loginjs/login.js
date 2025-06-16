// Função para carregar conteúdo dos cards
async function loadCardContent() {
    try {
        // Carrega o card de login
        const loginResponse = await fetch('login-card.html');
        const loginContent = await loginResponse.text();
        document.getElementById('login-content').innerHTML = loginContent;

        // Carrega o card de registro
        const registerResponse = await fetch('register-card.html');
        const registerContent = await registerResponse.text();
        document.getElementById('register-content').innerHTML = registerContent;

    } catch (error) {
        console.error('Erro ao carregar cards:', error);
    }
}

function flipCard(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const cardFlip = document.querySelector('.card-flip');
    cardFlip.classList.toggle('flipped');
    
    // Reset password visibility when flipping
    const passwordToggles = document.querySelectorAll('.password-toggle');
    passwordToggles.forEach(toggle => {
        const targetId = toggle.getAttribute('data-target');
        const input = document.getElementById(targetId);
        if (input) {
            input.setAttribute('type', 'password');
            toggle.classList.remove('fa-eye-slash');
            toggle.classList.add('fa-eye');
        }
    });
    
    // Reset password match icon
    const passwordMatchIcon = document.getElementById('passwordMatchIcon');
    if (passwordMatchIcon) {
        passwordMatchIcon.className = 'password-match-icon';
        passwordMatchIcon.innerHTML = '';
    }
    
    // Reset forms
    document.getElementById('loginForm').reset();
    document.getElementById('registerForm').reset();
}

document.addEventListener('DOMContentLoaded', async function() {
    // Carrega o conteúdo dos cards primeiro
    await loadCardContent();

    // Função para alternar visibilidade da senha
    function setupPasswordToggle() {
        const toggleButtons = document.querySelectorAll('.password-toggle');
        
        toggleButtons.forEach(button => {
            button.addEventListener('click', function() {
                const targetId = this.getAttribute('data-target');
                const passwordInput = document.getElementById(targetId);
                
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                
                this.classList.toggle('fa-eye');
                this.classList.toggle('fa-eye-slash');
            });
        });
    }

    // Função para validar senhas coincidentes
    function setupPasswordValidation() {
        const passwordInput = document.getElementById('registerPassword');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        const passwordMatchIcon = document.getElementById('passwordMatchIcon');

        function validatePasswordMatch() {
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;

            if (confirmPassword === '') {
                passwordMatchIcon.className = 'password-match-icon';
                passwordMatchIcon.innerHTML = '';
                return;
            }

            if (password === confirmPassword && password !== '') {
                passwordMatchIcon.className = 'password-match-icon fas fa-check correct';
            } else {
                passwordMatchIcon.className = 'password-match-icon fas fa-times incorrect';
            }
        }

        if (confirmPasswordInput && passwordInput) {
            confirmPasswordInput.addEventListener('input', validatePasswordMatch);
            passwordInput.addEventListener('input', validatePasswordMatch);
        }
    }

    // Função para flip do card
    function setupCardFlip() {
        const flipLinks = document.querySelectorAll('.flip-link');
        const cardFlip = document.querySelector('.card-flip');

        flipLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                cardFlip.classList.toggle('flipped');
                
                const passwordToggles = document.querySelectorAll('.password-toggle');
                passwordToggles.forEach(toggle => {
                    const targetId = toggle.getAttribute('data-target');
                    const input = document.getElementById(targetId);
                    if (input) {
                        input.setAttribute('type', 'password');
                        toggle.classList.remove('fa-eye-slash');
                        toggle.classList.add('fa-eye');
                    }
                });
                
                const passwordMatchIcon = document.getElementById('passwordMatchIcon');
                if (passwordMatchIcon) {
                    passwordMatchIcon.className = 'password-match-icon';
                    passwordMatchIcon.innerHTML = '';
                }
            });
        });
    }

    // Login form handler
    function setupLoginForm() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                try {
                    const email = document.getElementById('loginEmail').value;
                    const password = document.getElementById('loginPassword').value;

                    const response = await fetch('http://localhost:3000/usuarios');
                    const usuarios = await response.json();

                    const usuario = usuarios.find(u => u.email === email && u.senha === password);

                    if (usuario) {
                        localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
                        
                        const result = await Swal.fire({
                            title: 'Sucesso!',
                            text: 'Login realizado com sucesso',
                            icon: 'success',
                            confirmButtonText: 'OK',
                            confirmButtonColor: '#ff7a00',
                            background: '#111',
                            color: '#fff'
                        });
                        
                        if (result.isConfirmed) {
                            window.location.href = '../../../index.html';
                        }
                    } else {
                        await Swal.fire({
                            title: 'Erro',
                            text: 'Email ou senha inválidos',
                            icon: 'error',
                            confirmButtonText: 'OK',
                            confirmButtonColor: '#ff7a00',
                            background: '#111',
                            color: '#fff'
                        });
                    }
                } catch (error) {
                    await Swal.fire({
                        title: 'Erro',
                        text: 'Erro ao fazer login. Tente novamente.',
                        icon: 'error',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#ff7a00',
                        background: '#111',
                        color: '#fff'
                    });
                }
            });
        }
    }

    // Register form handler
    function setupRegisterForm() {
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            // Remove qualquer listener anterior para evitar duplicação
            registerForm.removeEventListener('submit', handleRegisterSubmit);
            
            // Adiciona o novo listener
            registerForm.addEventListener('submit', handleRegisterSubmit);
        }
    }

    // Função separada para o handler do registro
    async function handleRegisterSubmit(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        // Desabilita o botão para evitar múltiplos cliques
        const submitButton = e.target.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = true;
        }

        try {
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (password !== confirmPassword) {
                await Swal.fire({
                    title: 'Erro',
                    text: 'As senhas não coincidem',
                    icon: 'error',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#ff7a00',
                    background: '#111',
                    color: '#fff'
                });
                return;
            }

            const checkResponse = await fetch('http://localhost:3000/usuarios');
            const users = await checkResponse.json();

            if (users.some(user => user.email === email)) {
                await Swal.fire({
                    title: 'Erro',
                    text: 'Este email já está cadastrado',
                    icon: 'warning',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#ff7a00',
                    background: '#111',
                    color: '#fff'
                });
                return;
            }

            const response = await fetch('http://localhost:3000/usuarios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: Date.now().toString(),
                    nome: name,
                    email: email,
                    senha: password,
                    tipo: 'usuario'
                })
            });

            if (response.ok) {
                // Salva o usuário logado automaticamente após o registro
                const novoUsuario = {
                    id: Date.now().toString(),
                    nome: name,
                    email: email,
                    senha: password,
                    tipo: 'usuario'
                };
                localStorage.setItem('usuarioLogado', JSON.stringify(novoUsuario));
                
                // Mostra o popup de sucesso
                const result = await Swal.fire({
                    title: 'Sucesso!',
                    text: 'Cadastro realizado com sucesso! Você será redirecionado para a página inicial.',
                    icon: 'success',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#ff7a00',
                    background: '#111',
                    color: '#fff',
                    allowOutsideClick: false,
                    allowEscapeKey: false
                });
                
                // Após clicar em OK, redireciona para index.html
                if (result.isConfirmed) {
                    window.location.href = '../../../index.html';
                }
            }
        } catch (error) {
            console.error('Erro:', error);
            await Swal.fire({
                title: 'Erro',
                text: 'Erro ao registrar usuário',
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#ff7a00',
                background: '#111',
                color: '#fff'
            });
        } finally {
            // Reabilita o botão
            if (submitButton) {
                submitButton.disabled = false;
            }
        }
    }

    // Inicializar todas as funcionalidades
    setupPasswordToggle();
    setupPasswordValidation();
    setupCardFlip();
    setupLoginForm();
    setupRegisterForm();
});

// Utility function for alerts - versão simplificada
async function showAlert(title, message, icon) {
    return Swal.fire({
        title: title,
        text: message,
        icon: icon,
        confirmButtonText: 'OK',
        confirmButtonColor: '#ff7a00',
        background: '#111',
        color: '#fff'
    });
}

// Login form handler
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    try {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        const response = await fetch('http://localhost:3000/usuarios');
        const usuarios = await response.json();

        const usuario = usuarios.find(u => u.email === email && u.senha === password);

        if (usuario) {
            localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
            const result = await showAlert('Sucesso!', 'Login realizado com sucesso', 'success');
            
            if (result.isConfirmed) {
                window.location.href = '../../../index.html';
            }
        } else {
            showAlert('Erro', 'Email ou senha inválidos', 'error');
        }
    } catch (error) {
        showAlert('Erro', 'Erro ao fazer login. Tente novamente.', 'error');
    }
});

document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    try {
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            Swal.fire({
                title: 'Erro',
                text: 'As senhas não coincidem',
                icon: 'error',
                confirmButtonColor: '#ff7a00',
                background: '#111',
                color: '#fff'
            });
            return;
        }

        const checkResponse = await fetch('http://localhost:3000/usuarios');
        const users = await checkResponse.json();

        if (users.some(user => user.email === email)) {
            Swal.fire({
                title: 'Erro',
                text: 'Este email já está cadastrado',
                icon: 'warning',
                confirmButtonColor: '#ff7a00',
                background: '#111',
                color: '#fff'
            });
            return;
        }

        const response = await fetch('http://localhost:3000/usuarios', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: Date.now().toString(),
                nome: name,
                email: email,
                senha: password,
                tipo: 'usuario'
            })
        });

        if (response.ok) {
            Swal.fire({
                title: 'Sucesso!',
                text: 'Cadastro realizado com sucesso!',
                icon: 'success',
                confirmButtonText: 'OK',
                confirmButtonColor: '#ff7a00',
                background: '#111',
                color: '#fff'
            }).then((result) => {
                if (result.isConfirmed) {
                    document.getElementById('registerForm').reset();
                    
                    // Reset dos ícones de senha
                    const passwordMatchIcon = document.getElementById('passwordMatchIcon');
                    if (passwordMatchIcon) {
                        passwordMatchIcon.className = 'password-match-icon';
                        passwordMatchIcon.innerHTML = '';
                    }
                    
                    // Reset dos toggles de senha
                    const passwordToggles = document.querySelectorAll('.password-toggle');
                    passwordToggles.forEach(toggle => {
                        const targetId = toggle.getAttribute('data-target');
                        const input = document.getElementById(targetId);
                        if (input) {
                            input.setAttribute('type', 'password');
                            toggle.classList.remove('fa-eye-slash');
                            toggle.classList.add('fa-eye');
                        }
                    });
                    
                    // Vira o card para login
                    document.querySelector('.card-flip').classList.remove('flipped');
                }
            });
        }
    } catch (error) {
        console.error('Erro:', error);
        Swal.fire({
            title: 'Erro',
            text: 'Erro ao registrar usuário',
            icon: 'error',
            confirmButtonColor: '#ff7a00',
            background: '#111',
            color: '#fff'
        });
    }
});

// Função para alternar visibilidade da senha
function togglePassword(targetId) {
    const passwordInput = document.getElementById(targetId);
    const toggleButton = document.querySelector(`[data-target="${targetId}"]`);
    
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    toggleButton.classList.toggle('fa-eye');
    toggleButton.classList.toggle('fa-eye-slash');
}

// Função para validar senhas coincidentes
function validatePasswordMatch() {
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const passwordMatchIcon = document.getElementById('passwordMatchIcon');

    if (confirmPassword === '') {
        passwordMatchIcon.className = 'password-match-icon';
        passwordMatchIcon.innerHTML = '';
        return;
    }

    if (password === confirmPassword && password !== '') {
        passwordMatchIcon.className = 'password-match-icon fas fa-check correct';
    } else {
        passwordMatchIcon.className = 'password-match-icon fas fa-times incorrect';
    }
}

// Função para login
async function handleLogin() {
    try {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            await Swal.fire({
                title: 'Erro',
                text: 'Por favor, preencha todos os campos',
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#ff7a00',
                background: '#111',
                color: '#fff'
            });
            return;
        }

        const response = await fetch('http://localhost:3000/usuarios');
        const usuarios = await response.json();

        const usuario = usuarios.find(u => u.email === email && u.senha === password);

        if (usuario) {
            localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
            
            const result = await Swal.fire({
                title: 'Sucesso!',
                text: 'Login realizado com sucesso',
                icon: 'success',
                confirmButtonText: 'OK',
                confirmButtonColor: '#ff7a00',
                background: '#111',
                color: '#fff'
            });
            
            if (result.isConfirmed) {
                window.location.href = '../../../index.html';
            }
        } else {
            await Swal.fire({
                title: 'Erro',
                text: 'Email ou senha inválidos',
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#ff7a00',
                background: '#111',
                color: '#fff'
            });
        }
    } catch (error) {
        await Swal.fire({
            title: 'Erro',
            text: 'Erro ao fazer login. Tente novamente.',
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#ff7a00',
            background: '#111',
            color: '#fff'
        });
    }
}

// Função para registro
async function handleRegister() {
    try {
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!name || !email || !password || !confirmPassword) {
            await Swal.fire({
                title: 'Erro',
                text: 'Por favor, preencha todos os campos',
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#ff7a00',
                background: '#111',
                color: '#fff'
            });
            return;
        }

        if (password !== confirmPassword) {
            await Swal.fire({
                title: 'Erro',
                text: 'As senhas não coincidem',
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#ff7a00',
                background: '#111',
                color: '#fff'
            });
            return;
        }

        const checkResponse = await fetch('http://localhost:3000/usuarios');
        const users = await checkResponse.json();

        if (users.some(user => user.email === email)) {
            await Swal.fire({
                title: 'Erro',
                text: 'Este email já está cadastrado',
                icon: 'warning',
                confirmButtonText: 'OK',
                confirmButtonColor: '#ff7a00',
                background: '#111',
                color: '#fff'
            });
            return;
        }

        const response = await fetch('http://localhost:3000/usuarios', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: Date.now().toString(),
                nome: name,
                email: email,
                senha: password,
                tipo: 'usuario'
            })
        });

        if (response.ok) {
            // Salva o usuário logado automaticamente após o registro
            const novoUsuario = {
                id: Date.now().toString(),
                nome: name,
                email: email,
                senha: password,
                tipo: 'usuario'
            };
            localStorage.setItem('usuarioLogado', JSON.stringify(novoUsuario));
            
            // Mostra o popup de sucesso
            const result = await Swal.fire({
                title: 'Sucesso!',
                text: 'Cadastro realizado com sucesso! Você será redirecionado para a página inicial.',
                icon: 'success',
                confirmButtonText: 'OK',
                confirmButtonColor: '#ff7a00',
                background: '#111',
                color: '#fff',
                allowOutsideClick: false,
                allowEscapeKey: false
            });
            
            // Após clicar em OK, redireciona para index.html
            if (result.isConfirmed) {
                window.location.href = '../../../index.html';
            }
        }
    } catch (error) {
        console.error('Erro:', error);
        await Swal.fire({
            title: 'Erro',
            text: 'Erro ao registrar usuário',
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#ff7a00',
            background: '#111',
            color: '#fff'
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Setup password toggles
    const toggleButtons = document.querySelectorAll('.password-toggle');
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            togglePassword(targetId);
        });
    });

    // Setup password validation
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const passwordInput = document.getElementById('registerPassword');
    
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', validatePasswordMatch);
    }
    if (passwordInput) {
        passwordInput.addEventListener('input', validatePasswordMatch);
    }

    // Setup flip links - ADICIONADO
    const flipLinks = document.querySelectorAll('.flip-link');
    flipLinks.forEach(link => {
        link.addEventListener('click', flipCard);
    });
});