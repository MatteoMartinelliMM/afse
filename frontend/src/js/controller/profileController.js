import HttpInteractor from "@/js/utils/httpInteractor";
import Profile from "@/js/view/profile";

class ProfileController {
    constructor() {
    }

    getUserInfo() {
        return new Promise((resolve, reject) => {
            return new HttpInteractor().getAuthenticated('http://localhost:3000/user/profile')
                .then(user => {
                    this.user = user
                    resolve(this.user);
                })
                .catch(e => {
                    console.log(e)
                    reject(e)
                })
        })
    }

    onDeleteAccount() {
        return new Promise((resolve, reject) => {
            return new HttpInteractor().deleteAuthenticated('http://localhost:3000/auth/deleteAccount')
                .then(data => {
                    resolve(data)
                }).catch(e => reject(e))
        })
    }

    onSearchingFavouriteHero(name) {
        return new Promise((resolve, reject) => {
            new HttpInteractor().getAuthenticated(`http://localhost:3000/marvel/charactersTrade/${name}`)
                .then(data => resolve(data))
                .catch(e => reject(e))
        })
    }

    onFavouriteHeroPicked(result) {
        return new Promise((resolve, reject) => {
            new HttpInteractor().putAuthenticated('http://localhost:3000/user/changeFavouriteHero', {
                body: JSON.stringify({id: result.id}), headers: {"Content-Type": "application/json"}
            }).then(_ => {
                this.user.favouriteHero.favouriteHeroImage = `${result.thumbnail.path}.${result.thumbnail.extension}`
                this.user.favouriteHero.favouriteHeroName = result.name
                this.user.favouriteHero.favouriteHeroId = result.id
                resolve(this.user)
            }).catch(e => {
                console.log(e);
                reject(e)
            })
        })
    }

    onLogout() {
        return new Promise((resolve, reject) => {
            new HttpInteractor().postAuthenticated('http://localhost:3000/auth/logout')
                .then(data => {
                    sessionStorage.setItem('isAuthenticated', 'false')
                    resolve(data)
                })
                .catch(e => {
                    console.log(e);
                    reject(e)
                })
        })
    }
}

export default ProfileController