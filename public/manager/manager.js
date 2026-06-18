document.addEventListener('DOMContentLoaded', () => {
    if (!auth.requireRole(2, '../Buking/sign_in/index.html')) {
        return;
    }

    const sections = document.querySelectorAll('.admin-section');
    const links = document.querySelectorAll('.admin-menu a');

    links.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            sections.forEach(section => {
                section.style.display = 'none';
            });
            links.forEach(item => item.classList.remove('active'));
            link.classList.add('active');

            const sectionId = link.getAttribute('href').slice(1);
            const section = document.getElementById(sectionId);
            if (section) {
                section.style.display = 'block';
            }
        });
    });

    sections.forEach((section, index) => {
        section.style.display = index === 0 ? 'block' : 'none';
    });

    if (links[0]) {
        links[0].classList.add('active');
    }
});