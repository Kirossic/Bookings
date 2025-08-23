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
        div.innerHTML = `
            <img src="./img/logo_Blak.png" alt="${r.name}">
            <div class="hotel-card-content">
                <div class="hotel-card-title">${r.name}</div>
                <div class="hotel-card-desc">${r.description}</div>
                <div class="hotel-card-price">от ${r.price_per_hour} MDL/час</div>
                <button class="hotel-card-btn">Забронировать</button>
            </div>
        `;
        hotelList.appendChild(div);
    });
}
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
loadResources();