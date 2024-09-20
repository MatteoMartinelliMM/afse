import HttpInteractor from "@/js/utils/httpInteractor";
import TradeOfferModel from "@/js/model/tradeOfferModel";

class TradeOfferController {
    constructor() {
        this.tradeOfferModel = new TradeOfferModel()
    }

    enterOnPage() {
        return new Promise((resolve, reject) => {
            new HttpInteractor().getAuthenticated('http://localhost:3000/marketplace/tradableCards').then((data) => {
                this.exchangeable = data
                resolve(data)
                console.log(JSON.stringify(data))
            }).catch((e) => {
                console.log(e)
                reject(e)
            })
        })

    }

    onSearchingReceivingCardName(name) {
        return new Promise((resolve, reject) => {
            new HttpInteractor().getAuthenticated(`http://localhost:3000/marvel/charactersTrade/${name}`)
                .then(data => resolve(data))
                .catch(e => reject(e))
        })
    }

    getCardById(id) {
        return this.exchangeable.find(h => h.id === id)
    }

    onTradeCardSelected(id) {
        this.tradeOfferModel.addGiveCardId(id)
    }

    onTradeCardRemoved(id) {
        this.tradeOfferModel.removeGiveCardId(id)
    }

    onReceiveCardSelected(card) {
        this.tradeOfferModel.addReceiveCard(card)
    }

    onReceiveCardRemoved(card) {
        this.tradeOfferModel.removeReceiveCard(card)
    }

    confirmNewOffer() {
        console.log('call confirm offer')
        const tradeOfferModel = this.tradeOfferModel
        tradeOfferModel.recieveCards = tradeOfferModel.recieveCards.map(c => c.id)
        return new Promise((resolve, reject) => {
            new HttpInteractor().postAuthenticated(`http://localhost:3000/marketplace/createOffer`, {
                headers: {
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(tradeOfferModel)
            })
                .then(data => {
                    this.tradeOfferModel = new TradeOfferModel()
                    resolve(data);
                })
                .catch(e => reject(e))
        })
    }
}

export default TradeOfferController