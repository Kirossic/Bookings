let usersLocal = [];
async function loadUsers() {
    const res = await fetch('/api/users');
    const usersDB = await res.json();

    usersDB.forEach(u => {
        usersLocal.push(u)
    });
}
loadUsers();

let elemrnts = {
    name: document.getElementById('name'),
    email: document.getElementById('email'),
    password: document.getElementById('password'),
    button: document.getElementById('button')
}
elemrnts.button.addEventListener('click', async () => {
    if (!elemrnts.name.value || !elemrnts.email.value || !elemrnts.password.value) {
        alert('Заполните все поля');
        return;        
    }
    const user = usersLocal.find(u => u.email === elemrnts.email.value && u.password_hash === elemrnts.password.value);
    if (user) {
        alert(`Добро пожаловать, ${user.name}!`);
        window.location.href = "../home/index.html";
    } else {
        alert('Неверный email или пароль.');
    }
});
console.log(usersLocal);