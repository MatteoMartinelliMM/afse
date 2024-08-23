import HomeController from "../controller/homeController.js";
import navInstance from "../utils/navigator.js";
class HomeView{
    constructor(){
        this.homeController = new HomeController()
    }

    render() {
        console.log('render() home')
        let navBar = document.getElementById('navBar')
        navBar.classList.toggle('d-none', false)
    }
}
export  default HomeView