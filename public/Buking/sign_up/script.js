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
};
elemrnts.button.addEventListener('click', async () => {
    const name = elemrnts.name.value;
    const email = elemrnts.email.value;
    const password = elemrnts.password.value;

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
console.log(elemrnts);