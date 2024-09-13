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
let indexController = new IndexController()

document.addEventListener('DOMContentLoaded', () => {
    console.log('=====================================')
    console.log('call dom content loaded di index.html')
    const navBarDiv = document.getElementById('navBarDiv');
    navBarDiv.addEventListener('click', (event) => {
        const dropdownItem = event.target.closest('.dropdown-item');
        if (dropdownItem) {
            event.preventDefault();
            console.log('entro in dropdown links listner');
            const link = dropdownItem.getAttribute('data-link');
            console.log('goTo: ', link);
            navInstance.goTo(link);
        }
    });

// Event delegation per nav-link (esclusi quelli all'interno dei dropdown)
    navBarDiv.addEventListener('click', (event) => {
        const navLink = event.target.closest('.nav-link');
        if (navLink && !navLink.closest('.dropdown')) {
            event.preventDefault();
            console.log('entro in main nav links listner');
            const link = navLink.getAttribute('data-link');
            console.log('goTo: ', link);
            navInstance.goTo(link);
        }
    });
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