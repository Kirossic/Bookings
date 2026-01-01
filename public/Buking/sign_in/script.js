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
    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: elemrnts.email.value, password: elemrnts.password.value })
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