import HomeController from "../controller/homeController.js";
import navInstance from "../utils/navigator.js";

export function render() {
    console.log('render() home')
    let navBar = document.getElementById('navBar')
    navBar.classList.toggle('d-none', false)
}