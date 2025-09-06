document.addEventListener('DOMContentLoaded', () => {
    // Пример загрузки пользователей
    loadTable('users', '/api/users', ['id', 'name', 'email', 'role_id', 'created_at']);
    loadTable('roles', '/api/roles', ['id', 'name']);
    loadTable('resources', '/api/resources', ['id', 'name', 'type', 'status', 'price_per_hour']);
    loadTable('bookings', '/api/bookings', ['id', 'user_id', 'resource_id', 'start_time', 'end_time', 'status', 'delete_booking']);
    loadTable('payments', '/api/payments', ['id', 'booking_id', 'amount', 'status', 'payment_method', 'created_at']);
    loadTable('logs', '/api/logs', ['id', 'user_id', 'action', 'details', 'created_at']);

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
    // По умолчанию показываем первую секцию
    document.querySelectorAll('.admin-section').forEach((sec, i) => sec.style.display = i === 0 ? 'block' : 'none');
    document.querySelectorAll('.admin-menu a')[0].classList.add('active');
});

// Универсальная функция для загрузки и отображения таблицы
async function loadTable(sectionId, apiUrl, columns) {
    const tableDiv = document.getElementById(sectionId + '-table');
    tableDiv.innerHTML = '<p>Загрузка...</p>';
    try {
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error('Ошибка загрузки');
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) {
            tableDiv.innerHTML = '<p>Нет данных</p>';
            return;
        }
        let html = '<table class="admin-table"><thead><tr>';
        columns.forEach(col => html += `<th>${col}</th>`);
        html += '</tr></thead><tbody>';
        data.forEach(row => {
            html += '<tr>';
            columns.forEach(col => {
                if (col === 'delete_booking') {
                    html += `<td><button class="delete-booking-btn" data-id="${row.id}">Удалить</button></td>`;
                } else {
                    html += `<td>${row[col] ?? ''}</td>`;
                }
            });
            html += '</tr>';
        });
        html += '</tbody></table>';
        tableDiv.innerHTML = html;

        // Назначаем обработчики кнопкам удаления
        if (columns.includes('delete_booking')) {
            tableDiv.querySelectorAll('.delete-booking-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    if (!confirm('Вы уверены, что хотите удалить это бронирование?')) return;
                    try {
                        const res = await fetch(`/api/bookings/${btn.dataset.id}`, { method: 'DELETE' });
                        if (!res.ok) throw new Error('Ошибка удаления');
                        alert('Бронирование удалено');
                        loadTable(sectionId, apiUrl, columns); // Перезагрузка таблицы
                    } catch (err) {
                        alert('Ошибка при удалении бронирования');
                    }
                });
            });
        }
    } catch (err) {
        tableDiv.innerHTML = '<p style="color:red;">Ошибка загрузки данных</p>';
    }
}