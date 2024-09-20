import RegisterController from '../controller/registerController.js'
import navInstance from "../utils/navigator.js";
import {debounce} from "../utils/viewUtils.js";
import {Popover} from "bootstrap";

class RegisterView {
    constructor() {
        this.registerController = new RegisterController()
    }

    render() {
        document.getElementById('navBar').classList.toggle('d-none', true)
        const heroesAutocomplete = document.getElementById("autocomplete");
        const suggestionBox = document.getElementById("autocomplete-list");

        const registerBtn = document.getElementById('registerBtn')
        registerBtn.addEventListener('click', () => {
            registerBtn.querySelector('#buttonLoader').classList.toggle('d-none')

            this.registerController.onRegisterUser()
                .then(data => {
                    if (data.result) {
                        navInstance.goTo('/home');
                        return
                    }
                    registerBtn.querySelector('#buttonLoader').classList.toggle('d-none')
                    const registerError = document.getElementById('registerError')
                    registerError.classList.toggle('d-none', false)
                    registerError.innerHTML = data.message
                })
                .catch(e => {
                    registerBtn.querySelector('#buttonLoader').classList.toggle('d-none')
                    const registerError = document.getElementById('registerError')
                    registerError.classList.toggle('d-none', false)
                    registerError.innerHTML = 'Server does not respond.'
                });
        })

        const email = document.getElementById('email')
        email.addEventListener('blur', () => {
            email.classList.remove('is-valid', 'is-invalid')
            email.classList.add(this.registerController.validateEmailUi())
        })


        const password = document.getElementById('pwd')
        const confirmPwd = document.getElementById('confirmPwd')
        password.addEventListener('blur', () => this.#validPwdUi(password, confirmPwd))

        confirmPwd.addEventListener('blur', () => this.#validPwdUi(password, confirmPwd))

        const passwordRequirements = `
                <strong>Password Requirements:</strong>
                <ul>
                    <li>At least 8 characters in length.</li>
                    <li>At least one uppercase letter (A-Z).</li>
                    <li>At least one number (0-9).</li>
                    <li>At least one special character (e.g., @$!%*?&).</li>
                </ul>
            `;
        const popover = new Popover(password, {
            content: passwordRequirements,
            html: true,
            placement: 'left',
            trigger: 'focus'
        });

        const baseInfo = document.getElementById("baseInfo")
        baseInfo.addEventListener('input', (event) => {
            console.log(event.target.toString())
            return registerBtn.disabled = this.registerController.onInputTyping(event.target.id, event.target.value);
        })

        const suggestionTemplate = document.getElementById("suggestion-template");

        heroesAutocomplete.addEventListener("input", async () => {
            console.log('typing: ', heroesAutocomplete.value)
            const query = heroesAutocomplete.value;
            if (query.length < 3) {
                suggestionBox.innerHTML = '';
                registerBtn.disabled = this.registerController.onFavouriteHeroPicked()
                return;
            }
            debounce(() => {
                console.log(query)
                document.getElementById('autoCompleteLoader').classList.toggle('d-none', false)
                this.registerController.onSearchingFavHero(query)
                    .then((data) => {
                        console.log(data)
                        document.getElementById('autoCompleteLoader').classList.toggle('d-none', true)
                        suggestionBox.innerHTML = '';
                        data.forEach(result => {
                            const clone = suggestionTemplate.content.cloneNode(true);
                            const suggestion = clone.querySelector('.autocomplete-suggestion');
                            clone.querySelector('.avatar').src = `${result.thumbnail.path}.${result.thumbnail.extension}`
                            clone.querySelector('.name').innerHTML = result.name

                            suggestionBox.appendChild(clone)

                            suggestion.addEventListener("click", () => {
                                registerBtn.disabled = this.registerController.onFavouriteHeroPicked(result.id)
                                heroesAutocomplete.value = result.name
                                suggestionBox.innerHTML = ''
                            });
                            suggestionBox.appendChild(suggestion);
                        });
                    })
                    .catch(() => suggestionBox.innerHTML = '')
            })
        });

        // Close the suggestion box when clicking outside
        document.addEventListener("click", (e) => {
            if (e.target !== heroesAutocomplete) {
                suggestionBox.innerHTML = '';
            }
        });
    }

    #validPwdUi(password, confirmPwd) {
        const isValid = this.registerController.validPasswordUi()
        if (isValid) {
            password.classList.remove('is-valid', 'is-invalid')
            confirmPwd.classList.remove('is-valid', 'is-invalid')
            password.classList.add(isValid)
            confirmPwd.classList.add(isValid)
        }
    }
}

export default RegisterView


