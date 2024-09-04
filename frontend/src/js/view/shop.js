import ShopController from "@/js/controller/shopController";
import navInstance from "@/js/utils/navigator";

class ShopView {
    constructor() {
        this.shopController = new ShopController()
    }

    render() {
        console.log('render shop!')
        this.shopController.getUserInfo().then(() => {
            document.getElementById('tokenCount').innerHTML = `${this.shopController.user.coinAmount}`
            this.getPacks(this.shopController.user);
            this.shopController.getAvailableCoins().then((data) => {
                const coinsContainer = document.getElementById('availableCoins')
                coinsContainer.innerHTML = ''
                data.forEach(e => {
                    coinsContainer.innerHTML += `
                         <div class="col-auto text-center mt-2">
                            <div class="card" style="width: 18rem;">
                                <div id="coin-container" class="d-flex justify-content-center pt-3">
                                    <div class="coin">
                                        <div class="coin-inner">${e.amount}</div>
                                    </div>
                                </div>
                                <div class="card-body">
                                    <h5 class="card-title">${e.amount} Coin</h5>
                                    <p class="card-text">${e.description}</p>
                                    <a id="btn${e._id}" class="btn btn-outline-danger">Get coin</a>
                                </div>
                            </div>
                        </div>`;
                })
                data.forEach(e => {
                    document.getElementById(`btn${e._id}`).addEventListener('click', () => {
                        this.shopController.buyCoins(e._id)
                            .then((res) => {
                                this.shopController.getUserInfo().then(r => {
                                    document.getElementById('tokenCount').innerHTML = `${this.shopController.user.coinAmount}`
                                    this.getPacks(this.shopController.user)
                                }).catch(e => console.log(e))
                                console.log('Crediti acquistati con successo tot:', res.coinAmount);
                            })
                            .catch((e) => console.log(e))
                    })
                })

            }).catch((e) => {
                const coinsContainer = document.getElementById('availableCoins')
                if(coinsContainer) {
                    coinsContainer.innerHTML = '';
                    coinsContainer.innerHTML = `<h1 class="text-danger text-center">Errore nel recupero dei gettoni</h1>`
                }
            })
        }).catch(e => console.log(e))
    }

    getPacks(user) {
        this.shopController.getAvailablePacks().then((data) => {
            console.log('user soldi', user.coinAmount)
            const packContainer = document.getElementById('availablePacks')
            packContainer.innerHTML = ''
            data.forEach(e => {
                packContainer.innerHTML += `
                        <div class="col-auto text-center mt-2">
                            <div class="card" style="width: 18rem;">
                                <img src="/assets/common_pack.png" class="card-img-top" alt="...">
                                <div class="card-body">
                                    <h5 class="card-title">${e.name}</h5>
                                    <p class="card-text">${e.description}</p>
                                    <a href="#" id="btn${e._id}" class="btn btn-outline-danger ${user.coinAmount < e.cost ? 'disabled' : ''}">Buy for ${e.cost} coin</a>
                                </div>
                            </div>
                        </div>`;
            })
            data.forEach(e => {
                document.getElementById(`btn${e._id}`).addEventListener('click', () => {
                    this.shopController.buyPack(e._id)
                        .then(packId => {
                            if (packId) {
                                navInstance.goTo('/packRedeem', `?packId=${packId}`)
                                return;
                            }

                        })
                        .catch((e) => console.log(e))
                })
            })
        }).catch(e => {
            const packContainer = document.getElementById('availablePacks')
            if (packContainer) {
                packContainer.innerHTML = '';
                packContainer.innerHTML = `<h1 class="text-danger text-center">Errore nel recupero dei pacchetti</h1>`
            }
        })
    }
}

export default ShopView