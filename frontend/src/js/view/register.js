import RegisterController from '../controller/registerController.js'
import navInstance from "../utils/navigator.js";
import {debounce} from "../utils/viewUtils.js";

let registerController = new RegisterController()

export function render() {
    console.log('render register')
    const heroesAutocomplete = document.getElementById("autocomplete");
    const suggestionBox = document.getElementById("autocomplete-list");

    const registerBtn = document.getElementById('registerBtn')
    registerBtn.addEventListener('click', () => {
        registerBtn.querySelector('#buttonLoader').classList.toggle('d-none')

        registerController.onRegisterUser()
            .then(() => navInstance.goTo('/home'))
            .catch(() => {
                //todo gestire errore registrazione
            });
    })

    const baseInfo = document.getElementById("baseInfo")
    baseInfo.addEventListener('input', (event) =>
        debounce(() => registerBtn.disabled = registerController.onInputTyping(event.target.id, event.target.value)))

    const suggestionTemplate = document.getElementById("suggestion-template");

    heroesAutocomplete.addEventListener("input", async () => {
        const query = heroesAutocomplete.value;
        if (query.length < 3) {
            suggestionBox.innerHTML = '';
            registerBtn.disabled = registerController.onFavouriteHeroPicked()
            return;
        }
        debounce(() => {
            console.log(query)
            registerController.onSearchingFavHero(query)
                .then((data) => {
                    console.log(data)
                    suggestionBox.innerHTML = '';
                    data.forEach(result => {
                        const clone = suggestionTemplate.content.cloneNode(true);
                        const suggestion = clone.querySelector('.autocomplete-suggestion');
                        clone.querySelector('.avatar').src = `${result.thumbnail.path}.${result.thumbnail.extension}`
                        clone.querySelector('.name').innerHTML = result.name

                        suggestionBox.appendChild(clone)

                        suggestion.addEventListener("click", function () {
                            registerBtn.disabled = registerController.onFavouriteHeroPicked(result.id)
                            heroesAutocomplete.value = result.name
                            suggestionBox.innerHTML = ''
                        });
                        suggestionBox.appendChild(suggestion);
                    });
                })
                .catch(() => suggestionBox.innerHTML = '')
        })
    });

    const toggleSwitch = document.getElementById('toggleSwitch');
    const status = document.getElementById('status');

    toggleSwitch.addEventListener('change', () => {
        registerController.onHeroesVillainsToggle(toggleSwitch.checked)
        status.textContent = toggleSwitch.checked ? 'HERO' : 'VILLAIN'
    });


    // Close the suggestion box when clicking outside
    document.addEventListener("click", (e) => {
        if (e.target !== heroesAutocomplete) {
            suggestionBox.innerHTML = '';
        }
    });
}



