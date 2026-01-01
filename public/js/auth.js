// Общий модуль для работы с JWT аутентификацией

class Auth {
    constructor() {
        this.token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
    }

    // Проверка наличия токена
    isAuthenticated() {
        return !!this.token;
    }

    // Получить токен
    getToken() {
        return this.token;
    }

    // Получить пользователя
    getUser() {
        return this.user;
    }

    // Сохранить токен и пользователя после логина
    login(token, user) {
        this.token = token;
        this.user = user;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
    }

    // Выход
    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    // Получить заголовки с авторизацией
    getAuthHeaders(additionalHeaders = {}) {
        if (!this.token) {
            return additionalHeaders;
        }
        return {
            'Authorization': 'Bearer ' + this.token,
            ...additionalHeaders
        };
    }

    // Проверить роль пользователя
    hasRole(roleId) {
        return this.user && this.user.role_id === roleId;
    }

    // Защитить страницу - редирект если нет токена
    requireAuth(redirectUrl = '../Buking/sign_in/index.html') {
        if (!this.isAuthenticated()) {
            alert('Требуется авторизация');
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    }

    // Защитить страницу по роли
    requireRole(roleId, redirectUrl = '../Buking/sign_in/index.html') {
        if (!this.requireAuth(redirectUrl)) {
            return false;
        }
        if (!this.hasRole(roleId)) {
            alert('Недостаточно прав доступа');
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    }

    // Универсальный fetch с автоматическими заголовками
    async authFetch(url, options = {}) {
        const headers = this.getAuthHeaders(options.headers || {});
        const response = await fetch(url, {
            ...options,
            headers
        });

        // Если 401/403 - возможно токен истёк
        if (response.status === 401 || response.status === 403) {
            const data = await response.json().catch(() => ({}));
            if (data.error && (data.error.includes('токен') || data.error.includes('Токен'))) {
                alert('Сессия истекла, войдите снова');
                this.logout();
                window.location.href = '../Buking/sign_in/index.html';
            }
        }

        return response;
    }
}

// Создаём глобальный экземпляр
const auth = new Auth();
