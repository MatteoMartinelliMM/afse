import LoginController from "@/js/controller/loginController.js";
import navInstance from "@/js/utils/navigator.js";
import {debounce} from "@/js/utils/viewUtils.js";

class LoginView {
    constructor() {
        this.loginController = new LoginController();

    }

    render() {
        console.log('call render')
        document.getElementById('navBarDiv').classList.toggle('d-none', true)
        const loginErr = document.getElementById('loginError')
        const loginBtn = document.getElementById('loginBtn')
        loginBtn.addEventListener('click', () => {
            loginBtn.querySelector('#buttonLoader').classList.toggle('d-none')
            this.loginController.onLoginPressed()
                .then(() => {
                    loginErr.classList.toggle('d-none', true)
                    sessionStorage.setItem('isAuthenticated', 'true')
                    navInstance.goTo('/home');
                })
                .catch(_ => {
                    loginBtn.querySelector('#buttonLoader').classList.toggle('d-none')
                    loginErr.classList.toggle('d-none', false);
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
                return loginBtn.disabled = this.loginController.onEmailTyping(email.value);
            })
        })

        const pwd = document.getElementById('pwd')
        pwd.addEventListener('input', (event) => {
            console.log(pwd.value)
            debounce(() => loginBtn.disabled = this.loginController.onPwdTyping(pwd.value))
        })


    }

}

export default LoginView