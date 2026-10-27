let elements = {
    name: document.getElementById('name'),
    email: document.getElementById('email'),
    password: document.getElementById('password'),
    button: document.getElementById('button')
}
elements.button.addEventListener('click', async () => {
    if (!elements.email.value || !elements.password.value) {
        alert('Заполните все поля');
        return;        
    }
    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: elements.email.value, password: elements.password.value })
        });
        const data = await res.json();
        if (!res.ok) {
            alert(data.error || 'Ошибка входа');
            return;
        }
        // Используем auth модуль для сохранения
        auth.login(data.token, data.user);
        alert(`Добро пожаловать, ${data.user.name}!`);
        window.location.href = "../home/index.html";
    } catch (e) {
        alert('Ошибка сети');
    }
});