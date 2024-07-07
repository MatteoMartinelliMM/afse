import {loginUser} from "../auth.js";

class LoginController {

    constructor() {
        this.pwd = ''
        this.email = ''
    }

    onLoginPressed() {
        return new Promise((resolve, reject) => {
            loginUser(this.email, this.pwd)
                .then(() => resolve())
                .catch((e) => {
                    console.error('errore in login', e)
                    reject()
                })
        })

    }

    onEmailTyping(email) {
        console.log('ciao sono email', email)
        this.email = email;
        console.log('is valid email', this.email.isValidEmail())
    }

    onPwdTyping(pwd) {
        console.log('ciao sono pwd', pwd)
        this.pwd = pwd;
        console.log('is valid pwd', this.pwd)

    }

    disableLoginBtn() {
        console.log('email: ', this.email.isValidEmail())
        console.log('pwd: ', this.pwd.trim() === '')
        console.log('disable login', this.email.isValidEmail() || this.pwd.trim() === '')
        //todo poi this.email.isValidEmail()
        return this.email.trim() === '' || this.pwd.trim() === '';
    }
}


export default LoginController