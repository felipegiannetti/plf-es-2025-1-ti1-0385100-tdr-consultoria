function flipCard(event) {
    event.preventDefault();
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
    
    // Reset field styles
    document.querySelectorAll('.form-control').forEach(field => {
        field.classList.remove('success', 'error');
    });
}

// Função para alternar visibilidade da senha
function togglePassword(targetId) {
    const passwordInput = document.getElementById(targetId);
    const toggleButton = document.querySelector(`[data-target="${targetId}"]`);
    
    if (passwordInput && toggleButton) {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Alterna entre olho aberto e fechado
        toggleButton.classList.toggle('fa-eye');
        toggleButton.classList.toggle('fa-eye-slash');
    }
}

// Função para validar senhas coincidentes com animações
function validatePasswordMatch() {
    const passwordInput = document.getElementById('registerPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const passwordMatchIcon = document.getElementById('passwordMatchIcon');
    
    if (!passwordInput || !confirmPasswordInput || !passwordMatchIcon) return;

    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // Remove classes anteriores
    confirmPasswordInput.classList.remove('success', 'error');
    passwordMatchIcon.className = 'password-match-icon';

    if (confirmPassword === '') {
        passwordMatchIcon.innerHTML = '';
        return;
    }

    if (password === confirmPassword && password !== '') {
        // Senhas coincidem - animação de sucesso
        passwordMatchIcon.className = 'password-match-icon fas fa-check correct';
        confirmPasswordInput.classList.add('success');
    } else {
        // Senhas não coincidem - animação de erro
        passwordMatchIcon.className = 'password-match-icon fas fa-times incorrect';
        confirmPasswordInput.classList.add('error');
    }
}

// Função para adicionar ícones aos campos de senha
function addPasswordIcons() {
    // Adicionar olho para campo de login
    const loginPasswordField = document.getElementById('loginPassword');
    if (loginPasswordField && !loginPasswordField.parentElement.querySelector('.password-toggle')) {
        loginPasswordField.parentElement.classList.add('password-input-container');
        const loginToggle = document.createElement('i');
        loginToggle.className = 'fas fa-eye password-toggle';
        loginToggle.setAttribute('data-target', 'loginPassword');
        loginPasswordField.parentElement.appendChild(loginToggle);
    }

    // Adicionar olho para campo de senha do registro
    const registerPasswordField = document.getElementById('registerPassword');
    if (registerPasswordField && !registerPasswordField.parentElement.querySelector('.password-toggle')) {
        registerPasswordField.parentElement.classList.add('password-input-container');
        const registerToggle = document.createElement('i');
        registerToggle.className = 'fas fa-eye password-toggle';
        registerToggle.setAttribute('data-target', 'registerPassword');
        registerPasswordField.parentElement.appendChild(registerToggle);
    }

    // Adicionar olho e ícone de validação para confirmação de senha
    const confirmPasswordField = document.getElementById('confirmPassword');
    if (confirmPasswordField && !confirmPasswordField.parentElement.querySelector('.password-toggle')) {
        confirmPasswordField.parentElement.classList.add('password-input-container');
        
        const confirmToggle = document.createElement('i');
        confirmToggle.className = 'fas fa-eye password-toggle';
        confirmToggle.setAttribute('data-target', 'confirmPassword');
        
        const matchIcon = document.createElement('i');
        matchIcon.className = 'password-match-icon';
        matchIcon.id = 'passwordMatchIcon';
        
        confirmPasswordField.parentElement.appendChild(confirmToggle);
        confirmPasswordField.parentElement.appendChild(matchIcon);
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

        const response = await fetch('/usuarios');
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
        console.error('Erro no login:', error);
        await Swal.fire({
            title: 'Erro',
            text: 'Erro ao fazer login. Verifique sua conexão e tente novamente.',
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#ff7a00',
            background: '#111',
            color: '#fff'
        });
    }
}

// Função para registro (recarrega a página após sucesso)
async function handleRegister() {
    try {
        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
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

        if (name.length > 25) {
            await Swal.fire({
                title: 'Erro',
                text: 'O nome deve ter no máximo 25 caracteres',
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

        if (password.length < 6) {
            await Swal.fire({
                title: 'Erro',
                text: 'A senha deve ter pelo menos 6 caracteres',
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#ff7a00',
                background: '#111',
                color: '#fff'
            });
            return;
        }

        const checkResponse = await fetch('/usuarios');
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

        const novoUsuario = {
            id: Date.now().toString(),
            nome: name,
            email: email,
            senha: password,
            tipo: 'usuario'
        };

        const response = await fetch('/usuarios', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(novoUsuario)
        });

        if (response.ok) {
            // Recarrega a página (volta para o login)
            window.location.reload();
        } else {
            throw new Error('Erro na resposta do servidor');
        }
    } catch (error) {
        console.error('Erro no registro:', error);
        await Swal.fire({
            title: 'Erro',
            text: 'Erro ao registrar usuário. Tente novamente.',
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#ff7a00',
            background: '#111',
            color: '#fff'
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Adicionar ícones aos campos de senha
    addPasswordIcons();

    // Setup flip links
    const flipLinks = document.querySelectorAll('.flip-link');
    flipLinks.forEach(link => {
        link.addEventListener('click', flipCard);
    });

    // Setup password toggles
    function setupPasswordToggles() {
        const toggleButtons = document.querySelectorAll('.password-toggle');
        toggleButtons.forEach(button => {
            button.addEventListener('click', function() {
                const targetId = this.getAttribute('data-target');
                togglePassword(targetId);
            });
        });
    }

    // Setup password validation
    function setupPasswordValidation() {
        const confirmPasswordInput = document.getElementById('confirmPassword');
        const passwordInput = document.getElementById('registerPassword');
        
        if (confirmPasswordInput && passwordInput) {
            confirmPasswordInput.addEventListener('input', validatePasswordMatch);
            passwordInput.addEventListener('input', validatePasswordMatch);
        }
    }

    // Setup form handlers
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin();
        });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleRegister();
        });
    }

    // Initialize all setups
    setupPasswordToggles();
    setupPasswordValidation();
});