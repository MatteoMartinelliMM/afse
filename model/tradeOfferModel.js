class TradeOfferModel {
    constructor(userId, giveCards, receiveCards) {
        this.userId = userId
        this.giveCards = giveCards
        this.receiveCards = receiveCards
        this.status = 'inTrade'
        this.creationDate = new Date()
    }
}

module.exports = {TradeOfferModel}