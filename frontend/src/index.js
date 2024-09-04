import navInstance from './js/utils/navigator.js';
import IndexController from "./js/controller/indexController.js";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.js'
import './css/navbar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/autocomplete.css';
import './css/albumNav.css';
import './css/heroCard.css';
import './css/style.css';
import './css/navbar.css';
import './css/switch.css';
import './css/token.css';
import './js/utils/ext.js';
import './assets/common_pack.png'

let indexController = new IndexController()

document.addEventListener('DOMContentLoaded', () => {
    console.log('call from here')

    navInstance.listen(() => {
        console.log('soy el listner')
        //indexController.showNavbar() ? navBar.classList.remove('d-none') : navBar.classList.add('d-none')
    })
    const isAuthenticated = sessionStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
        indexController.onPageLoad()
            .then((data) => {
                sessionStorage.setItem('isAuthenticated', 'true')
                navInstance.goTo('/home');
            })
            .catch((e) => navInstance.goTo('/login'))
    }
    const navLinks = document.querySelectorAll('.nav-link')

    navLinks.forEach(navLink => {
        if (navLink.closest('.dropdown')) return;
        navLink.addEventListener('click', (event) => {
            event.preventDefault();
            console.log('goTo: ', navLink.getAttribute('data-link'))
            navInstance.goTo(navLink.getAttribute('data-link'));
        })
    })

    const dropDownLinks = document.querySelectorAll('.dropdown-item')

    dropDownLinks.forEach((d) => d.addEventListener('click', (event) => {
        event.preventDefault()
        console.log('goTo: ', d.getAttribute('data-link'))
        navInstance.goTo(d.getAttribute('data-link'));
    }))
});