import navInstance from './js/utils/navigator.js';
import IndexController from "./js/controller/indexController.js";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.js'
import './css/navbar.css';
import './js/utils/ext.js'

let indexController = new IndexController()

document.addEventListener('DOMContentLoaded', () => {
    console.log('call from here')

    navInstance.listen(() => {
        console.log('soy el listner')
        //indexController.showNavbar() ? navBar.classList.remove('d-none') : navBar.classList.add('d-none')
    })

    indexController.onPageLoad()
        .then((data) => navInstance.goTo('/home'))
        .catch((e) => navInstance.goTo('/login'))

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