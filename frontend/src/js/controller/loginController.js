import HttpInteractor from "@/js/utils/httpInteractor";

class LoginController {

    constructor() {
        this.pwd = ''
        this.email = ''
    }

    onLoginPressed() {
        return new Promise((resolve, reject) => {
            return new HttpInteractor().postAuthenticated('http://localhost:3000/auth/login', {
                body: JSON.stringify({email: this.email, pwd: this.pwd}),
                headers: {"Content-Type": "application/json",},
            }).then(() => resolve()).catch(e => {
                console.error('errore in login', e)
                reject()
            })
        })

    }

    onEmailTyping(email) {
        this.email = email;
        return this._disableLoginBtn()
    }

    onPwdTyping(pwd) {
        this.pwd = pwd;
        return this._disableLoginBtn()
    }

    _disableLoginBtn() {
        return this.email.isNullOrEmpty() || this.pwd.isNullOrEmpty();
    }

    dai() {
        return new HttpInteractor().getAuthenticated('http://localhost:3000/shop/daiFigurine', {
            headers: {"Content-Type": "application/json",},
        })
    }
}


export default LoginController