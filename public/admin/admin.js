document.addEventListener('DOMContentLoaded', () => {
    // Проверка авторизации и роли администратора (role_id === 3)
    if (!auth.requireRole(3, '../Buking/sign_in/index.html')) {
        return;
    }

    setupSection('users', '/api/users', ['id', 'name', 'email', 'role_id', 'password', 'created_at']);
    setupSection('roles', '/api/roles', ['id', 'name']);
    setupSection('resources', '/api/resources', ['id', 'name', 'description', 'type', 'status', 'price_per_hour']);
    setupSection('bookings', '/api/bookings', ['id', 'user_id', 'resource_id', 'start_time', 'end_time', 'status']);
    setupSection('payments', '/api/payments', ['id', 'booking_id', 'amount', 'status', 'payment_method', 'created_at']);
    setupSection('logs', '/api/logs', ['id', 'user_id', 'action', 'details', 'created_at']);

    // Навигация по секциям
    document.querySelectorAll('.admin-menu a').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            document.querySelectorAll('.admin-section').forEach(sec => sec.style.display = 'none');
            document.querySelectorAll('.admin-menu a').forEach(a => a.classList.remove('active'));
            link.classList.add('active');
            const id = link.getAttribute('href').replace('#', '');
            document.getElementById(id).style.display = 'block';
        });
    });
    document.querySelectorAll('.admin-section').forEach((sec, i) => sec.style.display = i === 0 ? 'block' : 'none');
    document.querySelectorAll('.admin-menu a')[0].classList.add('active');
});

// Универсальная функция для секции с добавлением и удалением
function setupSection(sectionId, apiUrl, columns) {
    const section = document.getElementById(sectionId);
    section.innerHTML = `
        <h2>${sectionId.charAt(0).toUpperCase() + sectionId.slice(1)}</h2>
        <div class="admin-actions">
            <button class="add-btn" id="add-${sectionId}">Добавить</button>
        </div>
        <div id="${sectionId}-table"></div>
    `;
    loadTable(sectionId, apiUrl, columns);

    // Добавить обработчик для кнопки "Добавить"
    section.querySelector(`#add-${sectionId}`).addEventListener('click', () => {
        showAddForm(sectionId, apiUrl, columns);
    });
}

// Универсальная функция для загрузки и отображения таблицы с кнопкой удаления
async function loadTable(sectionId, apiUrl, columns) {
    const tableDiv = document.getElementById(sectionId + '-table');
    tableDiv.innerHTML = '<p>Загрузка...</p>';
    try {
        const res = await auth.authFetch(apiUrl);
        if (!res.ok) throw new Error('Ошибка загрузки');
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) {
            tableDiv.innerHTML = '<p>Нет данных</p>';
            return;
        }
        let html = '<table class="admin-table"><thead><tr>';
        columns.forEach(col => html += `<th>${col}</th>`);
        html += '<th>Удалить</th></tr></thead><tbody>';
        data.forEach(row => {
            html += '<tr>';
            columns.forEach(col => html += `<td>${row[col] ?? ''}</td>`);
            html += `<td><button class="delete-btn" data-id="${row.id}" data-section="${sectionId}">Удалить</button></td>`;
            html += '</tr>';
        });
        html += '</tbody></table>';
        tableDiv.innerHTML = html;

        // Назначаем обработчики кнопкам удаления
        tableDiv.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!confirm('Вы уверены, что хотите удалить эту запись?')) return;
                try {
                    let url = apiUrl;
                    if (!url.endsWith('/')) url += '/';
                    url += btn.dataset.id;
                    const res = await auth.authFetch(url, { method: 'DELETE' });
                    if (!res.ok) throw new Error('Ошибка удаления');
                    alert('Запись удалена');
                    loadTable(sectionId, apiUrl, columns);
                } catch (err) {
                    alert('Ошибка при удалении');
                    console.log(err);
                    
                }
            });
        });
    } catch (err) {
        tableDiv.innerHTML = '<p style="color:red;">Ошибка загрузки данных</p>';
    }
}

// Форма добавления записи
function showAddForm(sectionId, apiUrl, columns) {
    const tableDiv = document.getElementById(sectionId + '-table');
    let formHtml = `<form id="add-form"><h3>Добавить ${sectionId}</h3>`;
    columns.forEach(col => {
        if (col === 'id' || col === 'created_at') return;
        formHtml += `<label>${col}: <input name="${col}" required></label><br>`;
    });
    formHtml += `<button type="submit">Сохранить</button> <button type="button" id="cancel-add">Отмена</button></form>`;
    tableDiv.innerHTML = formHtml;

    document.getElementById('cancel-add').onclick = () => loadTable(sectionId, apiUrl, columns);

    document.getElementById('add-form').onsubmit = async (e) => {
        e.preventDefault();
        const form = e.target;
        const body = {};
        columns.forEach(col => {
            if (col === 'id' || col === 'created_at') return;
            body[col] = form[col].value;
        });
        try {
            const res = await auth.authFetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (!res.ok) throw new Error('Ошибка добавления');
            alert('Запись добавлена');
            loadTable(sectionId, apiUrl, columns);
        } catch (err) {
            alert('Ошибка при добавлении');
            console.log(err);
            
        }
    };
}