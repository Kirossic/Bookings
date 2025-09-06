const usersLocal = [];
async function loadUsers() {
    const res = await fetch('/api/users');
    if (!res.ok) {
        console.error('Ошибка при загрузке пользователей:', res.statusText);
        return;
    }
    const users = await res.json();
    const tbody = document.querySelector('#table tbody');
    tbody.innerHTML = '';
    users.forEach(u => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${u.id}</td>
            <td>${u.name || ''}</td>
            <td>${u.email || ''}</td>
            <td>${u.password_hash || ''}</td>
            <td>${u.role_id || ''}</td>
        `;
        tbody.appendChild(tr);
    });
}
loadUsers();