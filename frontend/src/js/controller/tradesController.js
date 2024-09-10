import HttpInteractor from "@/js/utils/httpInteractor";

class TradesController {
    constructor() {
    }

    getTrades() {
        return new Promise((resolve, reject) => {
            new HttpInteractor().getAuthenticated('http://localhost:3000/marketplace/trades')
                .then(data => {
                    this.currentPage = data.currentPage
                    this.othersOffers = data.othersOffers
                    this.userOffers = data.userOffers
                    resolve(data)
                }).catch(e => console.log(e))
        })
    }

    cannotAcceptOffer(offer) {
        return offer.giveCard.every(c => !c.owned) && offer.receiveCard.every(c => c.owned)
    }

    onActionButtonPressed(offerId, deleteOffer) {
        return new Promise((resolve, reject) => {
            deleteOffer ? new HttpInteractor().deleteAuthenticated('http://localhost:3000/marketplace/deleteOffer', {
                headers: {
                    'Content-Type': 'application/json'
                }, body: JSON.stringify({offerId: offerId})
            }).then(_ => {
                let index = this.userOffers.findIndex(o => o._id.toString() === offerId);
                if (index !== -1) {
                    this.userOffers.splice(index, 1);
                }
                resolve(this.userOffers)
            }).catch(e => reject(e)) : new HttpInteractor().postAuthenticated('http://localhost:3000/marketplace/acceptOffer', {
                headers: {
                    'Content-Type': 'application/json'
                }, body: JSON.stringify({offerId: offerId, currentPage: this.currentPage})
            }).then(data => {
                this.othersOffers = data.othersOffers
                this.userOffers = data.userOffers
                resolve(data)
            }).catch(e => reject(e))
        })
    }
}

export default TradesController