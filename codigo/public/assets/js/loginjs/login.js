function flipCard(event) {
    event.preventDefault();
    const cardFlip = document.querySelector('.card-flip');
    cardFlip.classList.toggle('flipped');
}

// Add event listeners to both flip links
document.addEventListener('DOMContentLoaded', function() {
    const flipLinks = document.querySelectorAll('.flip-link');
    flipLinks.forEach(link => {
        link.addEventListener('click', flipCard);
    });
});

// Utility function for alerts
async function showAlert(title, message, icon) {
    return await Swal.fire({
        title: title,
        text: message,
        icon: icon,
        confirmButtonText: 'OK',
        confirmButtonColor: '#ff7a00',
        background: '#111',
        color: '#fff',
        showConfirmButton: true,
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
        customClass: {
            popup: 'swal-custom-popup',
            confirmButton: 'swal-custom-button'
        }
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
            await Swal.fire({
                title: 'Erro',
                text: 'As senhas não coincidem',
                icon: 'error',
                confirmButtonColor: '#ff7a00',
                background: '#111',
                color: '#fff',
                customClass: {
                    popup: 'swal-custom-popup',
                    confirmButton: 'swal-custom-button'
                }
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
                confirmButtonColor: '#ff7a00',
                background: '#111',
                color: '#fff',
                customClass: {
                    popup: 'swal-custom-popup',
                    confirmButton: 'swal-custom-button'
                }
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
            const result = await Swal.fire({
                title: 'Sucesso!',
                text: 'Cadastro realizado com sucesso!',
                icon: 'success',
                confirmButtonColor: '#ff7a00',
                background: '#111',
                color: '#fff',
                showConfirmButton: true,
                allowOutsideClick: false,
                allowEscapeKey: false,
                allowEnterKey: false,
                customClass: {
                    popup: 'swal-custom-popup',
                    confirmButton: 'swal-custom-button'
                }
            });

            // Only flip card after user clicks OK
            if (result.isConfirmed) {
                document.getElementById('registerForm').reset();
                document.querySelector('.card-flip').classList.remove('flipped');
            }
        }
    } catch (error) {
        console.error('Erro:', error);
        await Swal.fire({
            title: 'Erro',
            text: 'Erro ao registrar usuário',
            icon: 'error',
            confirmButtonColor: '#ff7a00',
            background: '#111',
            color: '#fff',
            customClass: {
                popup: 'swal-custom-popup',
                confirmButton: 'swal-custom-button'
            }
        });
    }
});