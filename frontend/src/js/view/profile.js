import ProfileController from "@/js/controller/profileController";
import navInstance from "@/js/utils/navigator";
import {debounce} from "@/js/utils/viewUtils";
import {Collapse} from 'bootstrap'
import {Modal} from 'bootstrap';


class ProfileView {
    constructor() {
        this.profileController = new ProfileController()
    }

    render() {
        const mainContainer = document.getElementById('mainContainer')
        this.profileController.getUserInfo()
            .then(user => {
                this.#toggleContainer('mainLoaderContainer', true)
                this.#toggleContainer('userContainer', false)
                const name = document.getElementById('name')
                name.innerHTML = user.name
                const surname = document.getElementById('surname')
                surname.innerHTML = user.surname
                const email = document.getElementById('email')
                email.innerHTML = user.email
                const username = document.getElementById('username')
                username.innerHTML = user.username
                const coinAmount = document.getElementById('coinAmount')
                coinAmount.innerHTML = user.coinAmount
                document.getElementById('deleteAccount').addEventListener('click', () => {
                    const deleteAccountModal = new Modal(document.getElementById('deleteAccountModal'));
                    deleteAccountModal.show();
                    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
                    confirmDeleteBtn.addEventListener('click', () => {
                        this.#toggleContainer('mainLoaderContainer', false)
                        this.#toggleContainer('userContainer', true)
                        this.profileController.onDeleteAccount()
                            .then(_ => navInstance.goTo('/login'))
                            .catch(e => console.log(e))

                        deleteAccountModal.hide();
                    });
                })
                document.getElementById('logout').addEventListener('click', () => {
                    this.profileController.onLogout()
                        .then(_ => navInstance.goTo('/login'))
                        .catch(e => console.log(e))
                })
                const heroImage = document.getElementById('heroImage')
                const favouriteHero = document.getElementById('favouriteHero')
                heroImage.src = user.favouriteHero.favouriteHeroImage
                heroImage.alt = user.favouriteHero.favouriteHeroName
                favouriteHero.innerHTML = user.favouriteHero.favouriteHeroName

                const heroAutoComplete = document.getElementById('autocomplete')
                const suggestionBox = document.getElementById('autocomplete-list');
                const suggestionTemplate = document.getElementById('suggestion-template');
                const collapseController = new Collapse(document.getElementById('collapseAutocomplete'), {toggle: false})
                heroAutoComplete.addEventListener('input', () => {
                    const query = heroAutoComplete.value;
                    if (query.length < 3) {
                        suggestionBox.innerHTML = '';
                        return;
                    }
                    debounce(() => {
                        console.log(query)
                        document.getElementById('autoCompleteLoader').classList.toggle('d-none', false)
                        this.profileController.onSearchingFavouriteHero(query)
                            .then((data) => {
                                document.getElementById('autoCompleteLoader').classList.toggle('d-none', true)
                                suggestionBox.innerHTML = '';
                                data.forEach(result => {
                                    const clone = suggestionTemplate.content.cloneNode(true);
                                    const suggestion = clone.querySelector('.autocomplete-suggestion');
                                    clone.querySelector('.avatar').src = `${result.thumbnail.path}.${result.thumbnail.extension}`
                                    clone.querySelector('.name').innerHTML = result.name

                                    suggestionBox.appendChild(clone)

                                    suggestion.addEventListener('click', () => {
                                        console.log(JSON.stringify(result))
                                        this.profileController.onFavouriteHeroPicked(result)
                                            .then(user => {
                                                heroImage.src = user.favouriteHero.favouriteHeroImage
                                                heroImage.alt = user.favouriteHero.favouriteHeroName
                                                favouriteHero.innerHTML = user.favouriteHero.favouriteHeroName
                                                collapseController.hide()
                                            }).catch(e => console.log(e))
                                        heroAutoComplete.value = ''
                                        suggestionBox.innerHTML = ''
                                    });
                                    suggestionBox.appendChild(suggestion);
                                });
                            })
                            .catch(e => {
                                console.log(e)
                                return suggestionBox.innerHTML = '';
                            })
                    })
                })
            }).catch(e => {
            console.log(e)
            this.#toggleContainer('mainLoaderContainer', true)
            return mainContainer.innerHTML += `<h1 class="text-center mt-5">Cannot load user info</h1>`;
        })
    }

    #toggleContainer(containerId, toggle) {
        document.getElementById(containerId).classList.toggle('d-none', toggle)
    }
}

export default ProfileView