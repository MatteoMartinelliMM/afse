import navInstance from './js/utils/navigator.js';
import IndexController from "./js/controller/indexController.js";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.js'
import './css/navbar.css';
import 'masonry-layout';
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
import {Dropdown} from "bootstrap";

let indexController = new IndexController()

document.addEventListener('DOMContentLoaded', () => {
    console.log('=====================================')
    console.log('call dom content loaded di index.html')
    const dropDownLinks = document.querySelectorAll('.dropdown-item')
    const dropDownMenu = document.getElementById('dropdownMenu')
    const dropdown = new Dropdown(dropDownMenu)
    dropDownLinks.forEach((d) => d.addEventListener('click', (event) => {
        console.log('entro in dropdown links');
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
    /*document.getElementById('marketplace').addEventListener('click', () => {
        console.log('cliccato marketplace')
        console.log(dropdown._isShown())
       if(dropdown._isShown()){
            dropdown.hide()
            return
        }
        dropdown.show()
    })*/
    navLinks.forEach(navLink => {
        console.log('entro in main nav links');
        navLink.addEventListener('click', (event) => {
            if (navLink.closest('.dropdown')) return;

            event.preventDefault();
            document.querySelectorAll('.nav-item').forEach(navItem => navItem.classList.remove('active'));
            const parentNavItem = navLink.closest('li');
            if (parentNavItem) {
                parentNavItem.classList.add('active');
            }

            console.log('goTo: ', navLink.getAttribute('data-link'))
            navInstance.goTo(navLink.getAttribute('data-link'));
        })
    })
    navInstance.listen(() => {
        console.log('chiamato il listner del navigator')
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
});