const elements = {
    main: document.getElementsByTagName("main"),
    profile_pic: document.getElementsByClassName("profile-pic"),
    options: document.getElementById("options"),
    close: document.getElementById("close"),
    booking_btn: document.getElementById("booking-btn"),
    user_email: document.getElementById("user-email"),
    check_in: document.getElementById("check-in"),
    check_out: document.getElementById("check-out")
}

// Проверка авторизации
if (!auth.requireAuth('../sign_in/index.html')) {
    // Переадресация произойдет в requireAuth
}

const currentUser = auth.getUser();

// Предзаполняем email текущего пользователя, если доступен
if (currentUser && elements.user_email) {
    elements.user_email.value = currentUser.email;
}

elements.profile_pic[0].addEventListener('click', () => {
    elements.options.style.display = "inline";
    elements.profile_pic[0].style.display = "none";
})
elements.close.addEventListener('click', () => {
    elements.options.style.display = "none";
    elements.profile_pic[0].style.display = "inline";
})

const log = async () => {
    const resource = await fetch('/api/resources');
    if (!resource.ok) {
        console.error('Ошибка при загрузке ресурсов:', resource.statusText);
        return;
    }
    const resources = await resource.json();
    // Найти контейнер по классу
    const hotelList = document.querySelector('.hotels-list');
    hotelList.innerHTML = ''; // Очистить старые карточки, если есть
    const hotelId = new URLSearchParams(window.location.search).get('hotelId');

    resources.forEach(resource => {
        if (hotelId && resource.id != hotelId) return;
        const status = resource.status;
        const div = document.createElement('div');
        div.className = 'hotel-card';
        div.innerHTML = `
        <div class="${status === 'Свободен' ? 'status-free':
        status !== 'Свободен' ? 'status-booked':
        ''}">${status}</div>
        <img src="./img/logo_Blak.png" alt="${resource.name}">
            <div class="hotel-card-content">
                <div class="hotel-card-title">${resource.name}</div>
                <div class="hotel-card-desc">${resource.description}</div>
                <div class="hotel-card-price">от ${resource.price_per_hour} MDL/час</div>
                <button class="hotel-card-btn" id="book-${resource.id}">Забронировать</button>
            </div>
        `;
        hotelList.appendChild(div);
        if (status !== 'Свободен') {
            div.style.opacity = '0.6';
            div.style.pointerEvents = 'none';
        }
        const bookButton = div.querySelector('.hotel-card-btn');
        bookButton.style.display = 'none'

        elements.booking_btn.addEventListener('click', async () => {
            const email = elements.user_email.value;
            const start_time = elements.check_in.value;
            const end_time = elements.check_out.value;
            const user_id = currentUser ? currentUser.id : null;
            const resource_id = resource.id;
            const resource_status = resource.status;

        if (new Date(start_time) >= new Date(end_time)) {
            alert('Дата выезда должна быть позже даты заезда');
            location.reload();
            return;
        }
        if (!email || !start_time || !end_time) {
            alert('Заполните все поля');
            location.reload();
            return;
        }
        if (resource_status != 'Свободен') {
            alert('Отель уже забронирован')
            location.reload();
            return
        }
        if (!user_id) {
            alert('Не удалось определить пользователя');
            location.reload();
            return;
        }
        
        const res = await auth.authFetch('/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_id, resource_id, start_time, end_time, status: 'В ожидании' })
        });
        const req = await auth.authFetch('/api/resources/' + resource_id, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'В ожидании' })
        });
    console.log('Response status:', res.status + '   ' + res.ok);

        if (req.ok) {
            const updatedResource = await req.json();
            console.log('Ресурс обновлен:', updatedResource);
        } else {
            alert('Ошибка при обновлении ресурса');
            console.error('Ошибка при обновлении ресурса');
        }
        if (res.ok) {
            const newBooking = await res.json();
            console.log('Бронирование добавлено:', newBooking);
            alert('Бронирование успешно!');
        } else if (res.status === 409) {
            alert('Бронирование с таким email уже существует!');
        } else {
            alert('Ошибка при добавлении бронирования');
            console.error('Ошибка при добавлении бронирования');
        }
    location.reload();
    })
    
    });
}

log();