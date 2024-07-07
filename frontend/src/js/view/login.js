import LoginController from "../controller/loginController.js";
import navInstance from "../utils/navigator.js";
import {debounce} from "../utils/viewUtils.js";

let loginController = new LoginController()

export function render() {
    document.getElementById('navBar').classList.toggle('d-none', true)
    const loginBtn = document.getElementById('loginBtn')
    loginBtn.addEventListener('click', () => {
        loginBtn.querySelector('#buttonLoader').classList.toggle('d-none')
        loginController.onLoginPressed()
            .then(() => navInstance.goTo('/home'))
            .catch(() => {
                //todo gestione errore login
            })
    })

    const registerLink = document.getElementById('register')
    registerLink.addEventListener('click', (event) => {
        event.preventDefault()
        navInstance.goTo('/register');
    })

    const email = document.getElementById('email')
    email.addEventListener('input', (event) => {
        console.log(email.value)
        debounce(() => {
            console.log('onDebounce')
            return loginBtn.disabled = loginController.onEmailTyping(email.value);
        })
    })

    const pwd = document.getElementById('pwd')
    pwd.addEventListener('input', (event) => {
        console.log(pwd.value)
        debounce(() => loginBtn.disabled = loginController.onPwdTyping(pwd.value))
    })


}