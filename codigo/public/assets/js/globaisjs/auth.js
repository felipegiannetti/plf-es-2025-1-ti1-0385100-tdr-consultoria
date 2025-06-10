function isAdmin() {
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    return usuario && usuario.tipo === 'admin';
}

function checkAdminAccess() {
    if (!isAdmin()) {
        alert('Acesso negado. Área restrita para administradores.');
        window.location.href = '../../../index.html';
    }
}