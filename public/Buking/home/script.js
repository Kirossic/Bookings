async function loadResources() {
    const resource = await fetch('/api/resources');
    if (!resource.ok) {
        console.error('Ошибка при загрузке ресурсов:', resource.statusText);
        return;
    }
    const resources = await resource.json();
    // Найти контейнер по классу
    const hotelList = document.querySelector('.hotels-list');
    hotelList.innerHTML = ''; // Очистить старые карточки, если есть
    resources.forEach(r => {
        const div = document.createElement('div');
        div.className = 'hotel-card';
        if (r.status !== 'Свободен') {
            div.style.opacity = '0.6';
            div.style.pointerEvents = 'none';
        }
        // div.style.backgroundImage = `url('./img/hotel${r.id}.jpg')`;
        div.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
        div.innerHTML = `
            <img src="./img/logo_Blak.png" alt="${r.name}">
            <div class="hotel-card-content">
                <div class="hotel-card-title">${r.name}</div>
                <div class="hotel-card-desc">${r.description}</div>
                <div class="hotel-card-price">от ${r.price_per_hour} MDL/час</div>
                <button class="hotel-card-btn" id="book-${r.id}">Подробнее</button>
            </div>
        `;
        hotelList.appendChild(div);
    });
    log();
}
loadResources();
const elements = {
    main: document.getElementsByTagName("main"),
    profile_pic: document.getElementsByClassName("profile-pic"),
    options: document.getElementById("options"),
    close: document.getElementById("close")
}
elements.profile_pic[0].addEventListener('click', () => {
    elements.options.style.display = "inline";
    elements.profile_pic[0].style.display = "none";
})
elements.close.addEventListener('click', () => {
    elements.options.style.display = "none";
    elements.profile_pic[0].style.display = "inline";
})
console.log(elements.profile_pic);

function log() {
    const bookButtons = document.querySelectorAll('.hotel-card-btn');
    bookButtons.forEach(button => {
        button.addEventListener('click', async () => {
            
            const resource = await fetch('/api/resources');
            if (!resource.ok) {
                console.error('Ошибка при загрузке ресурсов:', resource.statusText);
                return;
            }
            const resources = await resource.json();
            
            const resourceId = button.id.split('-')[1];
            try {
                const res = await fetch(`/api/resources/${resourceId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ status: 'Свободен' })
                });
                console.log('Response status:', res.status + '   ' + res.ok);
            } catch (error) {
                console.error('Ошибка сети:', error);
                alert('Ошибка сети');
            }
            
            console.log(`Booking hotel with ID: ${resourceId}`);
            window.location.href = `./booking.html?hotelId=${button.id.split('-')[1]}`;
        });
    });
}