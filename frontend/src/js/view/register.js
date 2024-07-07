import {User} from "../model/user.js";

let heroesId, isHero

function onRegisterUser() {
    const name = document.getElementById("name").value;
    const surname = document.getElementById("surname").value;
    const email = document.getElementById("email").value;
    const pwd = document.getElementById("pwd").value;
    const confirmPwd = document.getElementById("confirmPwd").value;
    let u = new User(name, surname, email, pwd, isHero, heroesId)
    if (pwd === confirmPwd && u.isValidUser()) {
        return registerUser(u)
            .then(() => nav.goTo('/home'))
            .catch(() => console.log('error'))
    }
    let error = document.getElementById('erorr');
    error.classList.remove('d-none')
    error.innerHTML = 'Errore su qualche campo'
}

document.addEventListener("DOMContentLoaded", function () {
    const heroesAutocomplete = document.getElementById("autocomplete");
    const suggestionBox = document.getElementById("autocomplete-list");
    let debounceTimeout;

    const suggestionTemplate = document.getElementById("suggestion-template");

    heroesAutocomplete.addEventListener("input", async function () {
        const query = heroesAutocomplete.value;
        if (query.length < 3) {
            suggestionBox.innerHTML = '';
            return;
        }
        clearTimeout(debounceTimeout)
        debounceTimeout = setTimeout(async function () {
            console.log(query)
            fetch(`http://localhost:3000/marvel/characters/${query}`)
                .then((res) => res.json())
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
                            heroesId = result.id
                            heroesAutocomplete.value = result.name
                            suggestionBox.innerHTML = ''
                        });
                        suggestionBox.appendChild(suggestion);
                    });
                })
                .catch((e) => {
                    console.error("Error fetching data: ", e);
                    suggestionBox.innerHTML = '';

                });
        }, 300)
    });

    const toggleSwitch = document.getElementById('toggleSwitch');
    const status = document.getElementById('status');

    toggleSwitch.addEventListener('change', () => {
        status.textContent = toggleSwitch.checked ? 'HERO' : 'VILLAIN'
        isHero = toggleSwitch.checked
    });

    // Close the suggestion box when clicking outside
    document.addEventListener("click", function (e) {
        if (e.target !== heroesAutocomplete) {
            suggestionBox.innerHTML = '';
        }
    });
});



