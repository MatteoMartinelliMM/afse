import HttpInteractor from "@/js/utils/httpInteractor";
import TradeOfferModel from "../../../../model/tradeOffer";

class TradeOfferController {
    constructor() {
        this.tradeOfferModel = new TradeOfferModel()
    }

    enterOnPage() {
        return new Promise((resolve, reject) => {
            new HttpInteractor().getAuthenticated('http://localhost:3000/marketplace/offers').then((data) => {
                this.exchangeable = data.exchangeable
                resolve(data)
                console.log(JSON.stringify(data))
            }).catch((e) => {
                console.log(e)
                reject(e)
            })
        })

    }

    onSearchingReceivingCardName(cardName){

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
}

export default TradeOfferController