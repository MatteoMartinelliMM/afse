import LoginController from "../controller/loginController.js";
import navInstance from "../utils/navigator.js";

let loginController = new LoginController()

export function render() {
    let debounceTimeout;
    document.getElementById('navBar').classList.toggle('d-none', true)
    const loginBtn = document.getElementById('loginBtn')
    loginBtn.addEventListener('click', () => {
        loginBtn.querySelector('#buttonLoader').classList.toggle('d-none')
        loginBtn.innerHTML = ''
        loginController.onLoginPressed()
            .then(() => navInstance.goTo('/home'))
            .catch(() => {
                //todo gestione errore login
            })
    })

    const email = document.getElementById('email')
    document.getElementById('email').addEventListener('input', (event) => {
        console.log(email.value)
        clearTimeout(debounceTimeout)
        debounceTimeout = setTimeout(function () {
            loginController.onEmailTyping(email.value)
            loginBtn.disabled = loginController.disableLoginBtn()
        }, 300)
    })

    const pwd = document.getElementById('pwd')
    document.getElementById('pwd').addEventListener('input', (event) => {
        console.log(pwd.value)
        clearTimeout(debounceTimeout)
        debounceTimeout = setTimeout(function () {
            loginController.onPwdTyping(pwd.value)
            loginBtn.disabled = loginController.disableLoginBtn()
        }, 300)
    })


}