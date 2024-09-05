class TradeOfferModel {
    constructor() {
        this.giveCards = []
        this.recieveCards = []
    }

    addGiveCardId(cardId) {
        this.giveCards.push(cardId)
    }

    removeGiveCardId(cardId) {
        const index = this.giveCards.indexOf(cardId)
        if (index !== -1) this.giveCards.splice(index, 1)
        if (this.giveCards.length === 1)
            this.recieveCards = []
    }

    addReceiveCard(card) {
        this.recieveCards.push(card)
    }

    removeReceiveCard(card) {
        const index = this.recieveCards.indexOf(card)
        if (index !== -1) this.recieveCards.splice(index, 1)
    }


}

export default TradeOfferModel