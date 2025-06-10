function flipCard(event) {
    event.preventDefault();
    const cardFlip = document.querySelector('.card-flip');
    console.log('Flipping card...'); // Debug
    cardFlip.classList.toggle('flipped');
}

// Add event listeners to both flip links
document.addEventListener('DOMContentLoaded', function() {
    const flipLinks = document.querySelectorAll('.flip-link');
    flipLinks.forEach(link => {
        link.addEventListener('click', flipCard);
    });
});

// Function to handle login
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        // Fetch users from db.json
        const response = await fetch('http://localhost:3000/usuarios');
        const usuarios = await response.json();

        // Check if user exists and password matches
        const usuario = usuarios.find(u => u.email === email && u.senha === password);

        if (usuario) {
            // Store user info in localStorage for session management
            localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
            // Redirect to home page
            window.location.href = '../../../index.html';
        } else {
            alert('Email ou senha inválidos');
        }
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        alert('Erro ao fazer login. Tente novamente.');
    }
});

// Function to handle registration
document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validate passwords match
    if (password !== confirmPassword) {
        alert('As senhas não coincidem');
        return;
    }

    try {
        // Check if email already exists
        const checkResponse = await fetch('http://localhost:3000/usuarios');
        const existingUsers = await checkResponse.json();
        
        if (existingUsers.some(user => user.email === email)) {
            alert('Este email já está cadastrado');
            return;
        }

        // Create new user
        const response = await fetch('http://localhost:3000/usuarios', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: Date.now().toString(),
                nome: name,
                email: email,
                senha: password,
                tipo: 'usuario' // default user type
            })
        });

        if (response.ok) {
            alert('Cadastro realizado com sucesso!');
            // Clear form
            document.getElementById('registerForm').reset();
            // Flip back to login
            document.querySelector('.card-flip').classList.remove('flipped');
        } else {
            throw new Error('Erro ao registrar usuário');
        }
    } catch (error) {
        console.error('Erro no registro:', error);
        alert('Erro ao registrar. Tente novamente.');
    }
});