import {registerUser} from "../auth.js";
import User from "../../js/model/user.js"
import HttpInteractor from "@/js/utils/httpInteractor";

class RegisterController {
    constructor() {
        this.name = ''
        this.surname = ''
        this.email = ''
        this.pwd = ''
        this.confirmPwd = ''
        this.favouriteHero = undefined
    }

    onRegisterUser() {
        const u = new User(this.name, this.surname, this.email, this.pwd, this.isHero, this.favouriteHero)
        let options = {
            headers: {
                "Content-Type": "application/json",
            },
            credentials: 'include',
            body: JSON.stringify(u)
        }
        return new Promise((resolve, reject) => {
            new HttpInteractor().post('http://localhost:3000/auth/register', options)
                .then((res) => {
                    console.log('anche qua mannaggia al cazzo')
                    resolve();
                }).catch((e) => reject(e))
        })
    }

    onHeroesVillainsToggle(value) {
        this.isHero = value
    }

    onFavouriteHeroPicked(favHero) {
        this.favouriteHero = favHero
        console.log('favourite hero', this.favouriteHero)
        return this.disableRegisterBtn()
    }

    onInputTyping(id, value) {
        console.log('id: ', id)
        console.log('value: ', value)
        switch (id) {
            case 'name':
                this.name = value
                break;
            case 'surname':
                this.surname = value
                break;
            case 'email':
                this.email = value
                break;
            case 'pwd':
                this.pwd = value
                break;
            case 'confirmPwd':
                this.confirmPwd = value
                break;
        }
        return this.disableRegisterBtn()
    }

    disableRegisterBtn() {
        console.log('disable register')
        console.log('name', this.name.isNullOrEmpty())
        console.log('surname', this.surname.isNullOrEmpty())
        console.log('email', this.email.isNullOrEmpty())
        console.log('pwd', this.pwd.isNullOrEmpty())
        console.log('confirmPwd', this.confirmPwd.isNullOrEmpty())
        console.log('favHero', this.favouriteHero)
        //todo add after || !this.email.isValidEmail()
        return this.name.isNullOrEmpty() || this.surname.isNullOrEmpty()
            || (this.pwd.isNullOrEmpty() || this.confirmPwd.isNullOrEmpty()
                || this.pwd !== this.confirmPwd) || !this.favouriteHero
    }

    onSearchingFavHero(name) {
        return new Promise((resolve, reject) => {
            fetch(`http://localhost:3000/marvel/characters/${name}`)
                .then(res => res.json())
                .then(data => resolve(data))
                .catch((e) => {
                    console.log(e)
                    reject()
                })
        })
    }
}

export default RegisterController