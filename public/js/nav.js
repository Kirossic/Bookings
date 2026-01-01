// Общий скрипт навигации для отображения пользователя и кнопки выхода

document.addEventListener('DOMContentLoaded', () => {
    const user = auth.getUser();
    
    // Обновление приветствия, если есть элемент для отображения имени пользователя
    const userGreeting = document.getElementById('user-greeting');
    if (userGreeting && user) {
        userGreeting.textContent = `Привет, ${user.name}!`;
    }

    // Обработчик для кнопки выхода
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Вы уверены, что хотите выйти?')) {
                auth.logout();
                window.location.href = '../sign_in/index.html';
            }
        });
    }

    // Обработчик для кнопки входа (если пользователь не авторизован)
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        if (auth.isAuthenticated()) {
            loginBtn.style.display = 'none';
        }
    }

    // Обработчик для кнопки админки (только для админов)
    const adminBtn = document.getElementById('admin-btn');
    if (adminBtn) {
        if (!auth.hasRole(1)) {
            adminBtn.style.display = 'none';
        } else {
            adminBtn.addEventListener('click', () => {
                window.location.href = '/admin/admin.html';
            });
        }
    }
});
