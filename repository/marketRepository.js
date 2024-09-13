const db = require("../utils/mongodb");
const crypto = require('crypto');
const {ObjectId} = require('mongodb')
const userRepository = require('./userRepository')
const marvelService = require("../services/marvelService");

async function marketOfferCollection() {
    return (await db.getDbInstance()).collection('market_offer');
}


async function createTradeOffer(tradeOffer) {
    return await (await marketOfferCollection()).insertOne({
        bidder: tradeOffer.userId,
        giveCard: tradeOffer.giveCards,
        receiveCard: tradeOffer.receiveCards,
        status: tradeOffer.status,
        creationDate: new Date()
    })
}

async function getMarketOffersByUserId(userId) {
    return await (await marketOfferCollection()).find({bidder: new ObjectId(userId)}).toArray()
}

async function getMarketOffersByOthersUser(userId, page) {
    return await (await marketOfferCollection())
        .find({
            bidder: {$ne: userId},
            status: 'inTrade'
        })
        .sort({creationDate: -1})
        .skip((page - 1) * 10)
        .limit(10)
        .toArray()
}

async function findInTradeOffersForUser(userId) {
    return await (await marketOfferCollection()).find({
        bidder: userId,
        status: 'inTrade'
    }).toArray()
}

async function getTotalMarketOffersByOthersUser(userId) {
    return await (await marketOfferCollection()).countDocuments({bidder: {$ne: userId}})
}

async function getMarketOffers() {
    return await (await marketOfferCollection()).find().toArray()
}

async function getOfferById(offerId) {
    return await (await marketOfferCollection()).findOne({_id: new ObjectId(offerId),})
}

async function deleteTradeOfferById(tradeId) {
    let res = await (await marketOfferCollection()).deleteOne({_id: new ObjectId(tradeId)})
    return res.deletedCount > 0;
}

async function updateTradeStatus(offerId, fieldsToUpdate) {
    let res = await (await marketOfferCollection()).updateOne({_id: new ObjectId(offerId)}, {$set: fieldsToUpdate})
    return res.acknowledged
}

async function getRecentDeals() {
    return await (await marketOfferCollection()).find({status: 'completed'}).sort({dealDate: -1}).limit(10).toArray()
}

async function deleteInTradeOffersByUserId(userId) {
    return await (await marketOfferCollection()).deleteMany({status: 'inTrade', bidder: userId});
}

module.exports = {
    createMarketOffer: createTradeOffer,
    getMarketOffersByUserId: getMarketOffersByUserId,
    getMarketOffersByOthersUser: getMarketOffersByOthersUser,
    getTotalMarketOffersByOthersUser: getTotalMarketOffersByOthersUser,
    findInTradeOffersForUser: findInTradeOffersForUser,
    getOfferById: getOfferById,
    deleteTradeOfferById: deleteTradeOfferById,
    updateTradeStatus: updateTradeStatus,
    getRecentDeals: getRecentDeals,
    deleteInTradeOffersByUserId: deleteInTradeOffersByUserId,
    getMarketOffers: getMarketOffers,
}