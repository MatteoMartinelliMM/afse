import HttpInteractor from "@/js/utils/httpInteractor";

class ShopController {
    constructor() {
    }

    getAvailablePacks() {
        return new Promise((resolve, reject) => {
            new HttpInteractor().getAuthenticated('http://localhost:3000/shop/availablePacks')
                .then(data => {
                    resolve(data)
                })
                .catch(e => reject(e))
        })
    }

    getAvailableCoins() {
        return new Promise((resolve, reject) => {
            new HttpInteractor().getAuthenticated('http://localhost:3000/shop/coinsOffers')
                .then(data => {
                    resolve(data)
                })
                .catch(e => reject(e))
        })
    }

    buyCoins(coinOfferId) {
        return new Promise((resolve, reject) => {
            new HttpInteractor().postAuthenticated('http://localhost:3000/shop/buyCoin', {
                headers: {
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({coinOfferId: coinOfferId}
                )
            })
                .then(data => {
                    resolve(data)
                })
                .catch(e => reject(e))
        })
    }

    buyPack(packId) {
        return new Promise((resolve, reject) => {
            new HttpInteractor().postAuthenticated('http://localhost:3000/shop/buyPack', {
                headers: {
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({packId: packId}
                )
            })
                .then(data => {
                    console.log(data)
                    data ? resolve(data.packId) : reject()
                })
                .catch(e => {
                    console.log('nel catch del controller ci arricvo')
                    reject(e);
                })
        })
    }

    getUserInfo() {
        return new Promise((resolve, reject) => {
            new HttpInteractor().getAuthenticated('http://localhost:3000/user/info')
                .then(data => {
                    this.user = data
                    resolve(data)
                })
                .catch(e => reject(e))
        })
    }
}

export default ShopController