const db = require('../utils/mongodb');
const userRepository = require('./userRepository')
const {ObjectId} = require("mongodb");

async function packOfferCollection() {
    return (await db.getDbInstance()).collection('pack_offer');
}

async function packCollection() {
    return (await db.getDbInstance()).collection('pack');
}

async function coinCollection() {
    return (await db.getDbInstance()).collection('coin');
}

async function coinTransactionCollection() {
    return (await db.getDbInstance()).collection('coin_transaction');
}

async function addCoinTransaction(transaction) {
    return new Promise(async (resolve, reject) => {
        const res = await (await coinTransactionCollection()).insertOne(transaction)
        console.log('coinTransaction: ', res.acknowledged)
        if (res.acknowledged) {
            let user = await userRepository.findUserById(transaction.userId)
            user.coinAmount = user.coinAmount || 0
            user.coinAmount += transaction.coinAmount

            const resU = await userRepository.updateUser(user, {coinAmount: user.coinAmount})
            console.log('updateUser: ', resU)

            resolve(user.coinAmount)
            console.log('entro in res acknowledge')
            return;
        }
        console.log('entro in reject')
        reject()
    })

}

async function createPack(userId, packName, cardAmount) {
    const res = await (await packCollection()).insertOne({
        _id: new ObjectId(),
        userId: userId,
        packName: packName,
        cardAmount: cardAmount,
        date: new Date()
    })
    if (res.acknowledged)
        return res.insertedId
    return undefined
}

async function getCoinOfferById(coinOfferId) {
    return await (await coinCollection())
        .findOne({_id: new ObjectId(coinOfferId)});
}

async function getAvailablePacks() {
    return await (await packOfferCollection()).find().toArray();
}

async function getAvailableCoinOffers() {
    return await (await coinCollection()).find().toArray();
}

async function getPackOfferById(packId) {
    return await (await packOfferCollection())
        .findOne({_id: new ObjectId(packId)});
}

async function getPackById(packId) {
    return await (await packCollection())
        .findOne({_id: new ObjectId(packId)});
}

async function updatePack(packId, fieldToUpdate) {
    const res = await (await packCollection()).updateOne({_id: new ObjectId(packId)}, fieldToUpdate)
    return res.acknowledged
}

async function deletePacksByUserId(userId) {
    return await (await packCollection()).deleteMany({userId: userId});
}


module.exports = {
    getAvailablePacks: getAvailablePacks,
    getAvailableCoinOffers: getAvailableCoinOffers,
    addCoinTransaction: addCoinTransaction,
    getCoinOfferById: getCoinOfferById,
    getPackOfferById: getPackOfferById,
    getPackById: getPackById,
    createPack: createPack,
    updatePack: updatePack,
    deletePacksByUserId: deletePacksByUserId
}