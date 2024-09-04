const db = require("../utils/mongodb");
const crypto = require('crypto');
const {ObjectId} = require('mongodb')
const userRepository = require('./userRepository')
const marvelService = require("../services/marvelService");

async function marketOfferCollection() {
    return (await db.getDbInstance()).collection('market_offer');
}


async function createMarketOffer(marketOffer) {

}

async function getMarketOfferByUserId(userId) {
    return await (await marketOfferCollection()).find({bidder: userId}).toArray()
}

module.exports = {
    createMarketOffer: createMarketOffer,
    getMarketOfferByUserId: getMarketOfferByUserId,
}