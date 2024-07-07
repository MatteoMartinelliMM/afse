import navInstance from './utils/navigator.js';
import IndexController from "./controller/indexController.js";
import HomeController from "./controller/homeController.js";


let indexController = new IndexController()
let homeController = new HomeController()
let navBar = document.getElementById('navBar')

navInstance.addRoute('/', () => {
    indexController.onPageLoad().then((data) => {
        navInstance.goTo('/home')
    }).catch((e) => {
    })
})

navInstance.addRoute('/register', () => {
    console.log('sono register!')
})

navInstance.addRoute('/login', () => {
    console.log('sono login!')
})

navInstance.addRoute('/home', () => {
    console.log('sono la home!')
})

navInstance.listen(() => {
    indexController.showNavbar() ? navBar.classList.remove('d-none') : navBar.classList.add('d-none')
})

document.addEventListener('DOMContentLoaded', () => {
    console.log('call from here')
    indexController.onPageLoad()
        .then((data) => navInstance.goTo('/home'))
        .catch((e) => navInstance.goTo('/login'))
});