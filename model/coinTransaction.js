class CoinTransaction {
    constructor(userId, coinAmount, description, date) {
        this.userId = userId;
        this.coinAmount = coinAmount;
        this.description = description
        this.date = date;
    }

}

module.exports = CoinTransaction