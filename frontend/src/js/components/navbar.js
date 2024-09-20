import navInstance from "@/js/utils/navigator";


export function setNavbarItemActive(itemName) {
    document.querySelectorAll('.nav-item').forEach(navItem => navItem.classList.remove('active'));

    // Imposta la sezione attiva utilizzando l'ID fornito
    const activeNavItem = document.getElementById(itemName);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }
}

export function attachNavbarListeners() {
    const dropDownLinks = document.querySelectorAll('.dropdown-item')
    dropDownLinks.forEach((d) => d.addEventListener('click', (event) => {
        event.preventDefault()
        console.log('goTo: ', d.getAttribute('data-link'))
        navInstance.goTo(d.getAttribute('data-link'));
        let dropdownMenu = document.getElementById('dropdownMenu');
        let dropdownToggle = document.getElementById('navbarDropdown');

        if (!dropdownToggle.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.classList.remove('show');
        }
        document.querySelectorAll('.nav-item').forEach(navItem => navItem.classList.remove('active'));

    }))

    document.getElementById('navbarDropdown').addEventListener('click', function (e) {
        e.preventDefault();
        let dropdownMenu = document.getElementById('dropdownMenu');
        dropdownMenu.classList.toggle('show');
    });

    window.addEventListener('click', function (e) {
        let dropdownMenu = document.getElementById('dropdownMenu');
        let dropdownToggle = document.getElementById('navbarDropdown');
        if (!dropdownToggle.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.classList.remove('show');
        }
    });

    const navLinks = document.querySelectorAll('.nav-link')
    navLinks.forEach(navLink => {
        navLink.addEventListener('click', (event) => {
            if (navLink.closest('.dropdown')) return;

            event.preventDefault();
            /*document.querySelectorAll('.nav-item').forEach(navItem => navItem.classList.remove('active'));
            const parentNavItem = navLink.closest('li');
            if (parentNavItem) {
                parentNavItem.classList.add('active');
            }*/

            console.log('goTo: ', navLink.getAttribute('data-link'))
            navInstance.goTo(navLink.getAttribute('data-link'));
        })
    })
}
