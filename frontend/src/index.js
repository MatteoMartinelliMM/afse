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
import {attachNavbarListeners} from "@/js/components/navbar";

let indexController = new IndexController()

document.addEventListener('DOMContentLoaded', () => {
    attachNavbarListeners()

    navInstance.listen()

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