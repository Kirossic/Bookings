let usersLocal = [];
async function loadUsers() {
    const res = await fetch('/api/users');
    const usersDB = await res.json();

    usersDB.forEach(u => {
        usersLocal.push(u)
    });
}
loadUsers();

let elements = {
    name: document.getElementById('name'),
    email: document.getElementById('email'),
    password: document.getElementById('password'),
    button: document.getElementById('button')
};
elements.button.addEventListener('click', async () => {
    const name = elements.name.value;
    const email = elements.email.value;
    const password = elements.password.value;

    if (!name || !email || !password) {
        alert('Заполните все поля');
        return;
    }


    try {
        const res = await fetch('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });
        console.log('Response status:', res.status + '   ' + res.ok);

        if (res.ok) {
            const newUser = await res.json();
            usersLocal.push(newUser);
            console.log('Пользователь добавлен:', newUser);
            alert('Регистрация успешна!');
        } else if (res.status === 409) {
            alert('Пользователь с таким email уже существует!');
        } else {
            alert('Ошибка при добавлении пользователя');
            console.error('Ошибка при добавлении пользователя');
        }
    } catch (error) {
        console.error('Ошибка сети:', error);
        alert('Ошибка сети');
    }
    window.location.href = "../home/index.html";
});

console.log(usersLocal);
console.log(elements);