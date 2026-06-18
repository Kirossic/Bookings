// Общий скрипт навигации для отображения пользователя, выхода и меню по ролям

document.addEventListener('DOMContentLoaded', () => {
    const user = auth.getUser();
    const optionsMenu = document.getElementById('options');
    const profilePic = document.querySelector('.profile-pic');
    let closeItem = document.getElementById('close');

    if (optionsMenu) {
        const menuItems = [
            '<li><a href="../home/index.html">Home</a></li>'
        ];

        if (auth.isAuthenticated()) {
            if (auth.hasRole(3)) {
                menuItems.push('<li><a href="/admin/admin.html">CRUD</a></li>');
            }

            if (auth.hasRole(2)) {
                menuItems.push('<li><a href="/manager/manager.html">Manager</a></li>');
            }
        } else {
            menuItems.push('<li><a href="../sign_in/index.html">Sign In</a></li>');
            menuItems.push('<li><a href="../sign_up/index.html">Sign Up</a></li>');
        }

        menuItems.push('<li id="close">Close</li>');
        optionsMenu.innerHTML = menuItems.join('');
        closeItem = document.getElementById('close');
    }

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
    if (loginBtn && auth.isAuthenticated()) {
        loginBtn.style.display = 'none';
    }

    const toggleMenu = (show) => {
        if (optionsMenu) {
            optionsMenu.style.display = show ? 'inline' : 'none';
        }
        if (profilePic) {
            profilePic.style.display = show ? 'none' : 'inline';
        }
    };

    if (profilePic && optionsMenu && closeItem) {
        profilePic.addEventListener('click', () => toggleMenu(true));
        closeItem.addEventListener('click', () => toggleMenu(false));
    }
});
