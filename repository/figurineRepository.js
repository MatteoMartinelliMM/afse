const db = require("../utils/mongodb");
const crypto = require('crypto');
const {ObjectId} = require('mongodb')
const userRepository = require('./userRepository')
const marvelService = require("../services/marvelService");

async function userCollection() {
    return (await db.getDbInstance()).collection('users');
}

async function figurineCollection() {
    return (await db.getDbInstance()).collection('figurine');
}

async function checkFigurineOnServerStart() {
    const fCollection = await figurineCollection()
    const getFigurineAmount =
        fCollection.find().toArray().then(allFigurine => ({
            status: 'fulfilled',
            value: allFigurine.length
        })).catch(error => ({status: 'error', reason: error}))

    const getCharacterAmount = marvelService.getCharactersAmount().then(data => ({
        status: 'fulfilled',
        value: data
    })).catch((e) => ({status: 'error', reason: e}))

    const results = await Promise.allSettled([getFigurineAmount, getCharacterAmount])
    const dbRes = results[0]
    const apiRes = results[1]

    if (dbRes.status === 'fulfilled' && apiRes.status === 'fulfilled') {
        console.log('dbRes value: ', dbRes.value.value)
        console.log('apiRes value: ', apiRes.value.value)
        const dbFigurineAmount = dbRes.value.value;
        const apiFigurineAmount = apiRes.value.value;
        if (dbFigurineAmount !== apiFigurineAmount) {
            const limit = 100;
            const totalRequests = Math.ceil(apiFigurineAmount / limit)
            const figurineIds = []
            for (let i = 0; i < totalRequests; i++) {
                const offset = i * limit;
                const ids = await marvelService.getCharactersId(limit, offset)
                console.log(ids.join(', '))
                figurineIds.push(...ids)
            }
            await fCollection.deleteMany({})
            await fCollection.insertMany(figurineIds)
        }
    }
}

async function insertUserFigurine(userId, figurine) {
    let res = await (await userCollection()).updateOne(
        {_id: userId},
        {
            $push: {
                figurine: {
                    _id: new ObjectId(),
                    figurineId: figurine.figurineId,
                    name: figurine.name,
                }
            }
        }
    );
    return res.acknowledged;
}

async function insertUserFigurines(userId, figurines) {
    const figurinesToInsert = figurines.map(figurine => ({
        _id: new ObjectId(),
        figurineId: figurine.figurineId,
        name: figurine.name,
    }));
    let res = await (await userCollection()).updateOne(
        {_id: new ObjectId(userId)},
        {
            $push: {
                figurine: {
                    $each: figurinesToInsert
                }
            }
        }
    );

    return res.acknowledged;
}

async function insertUserExchangeableFigurines(userId, exchangeable, figurines) {
    figurines.forEach(fig => {
        exchangeable.push({
            _id: new ObjectId(),
            figurineId: fig.figurineId,
            name: fig.name,
            quantity: 1
        });
    })
    let res = await (await userCollection()).updateOne(
        {_id: new ObjectId(userId)},
        {$set: {exchangeable: exchangeable}}
    );
    return res.acknowledged;
}

async function getFigurine(userId, figurineId) {
    return await (await userCollection()).findOne({
        _id: new ObjectId(userId),
        "figurine.figurineId": figurineId
    }, {
        projection: {
            "figurine.$": 1
        }
    });
}

async function addFigurineDetails(data, userId) {
    const figurines = await getUserFigurines(userId)
    const figurinesId = figurines.map(f => f.figurineId)
    data.results = data.results.map(figurine => {
        const foundFigurine = figurines.find(f => f.figurineId === figurine.id);
        return {
            ...figurine,
            owned: figurinesId.includes(figurine.id),
        }
    })
    return data
}

async function getUserFigurines(userId) {
    const user = await (await userCollection()).findOne(
        {_id: new ObjectId(userId)},
        {projection: {'figurine': 1}}
    );
    return user?.figurine || [];
}

async function pickRandomFigurines(cardAmount) {
    const list = await (await figurineCollection()).find().toArray()
    const random = getRandomFigurine(list, cardAmount)
    return random.map(e => e.figurineid)
}

function shuffleIds(array) {
    // Copia l'array per non modificarlo direttamente
    const shuffledArray = array.slice();
    let currentIndex = shuffledArray.length, randomIndex;

    // Finché ci sono elementi da mischiare
    while (currentIndex !== 0) {
        // Scegli un indice casuale
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // Scambia l'elemento corrente con l'elemento casuale
        [shuffledArray[currentIndex], shuffledArray[randomIndex]] = [shuffledArray[randomIndex], shuffledArray[currentIndex]];
    }

    return shuffledArray;
}

function getRandomFigurine(array, numberOfElements) {
    if (numberOfElements > array.length) {
        throw new Error('Il numero di elementi richiesti è maggiore della lunghezza dell\'array.');
    }

    // Mischia l'array
    const shuffledArray = shuffleIds(array);

    // Restituisci i primi 'numberOfElements' elementi
    return shuffledArray.slice(0, numberOfElements);
}

function generateObjectIdFromFigurineId(figurineId) {
    // Usa SHA-1 per generare un hash
    const hash = crypto.createHash('sha1').update(figurineId).digest('hex');

    // Prendi i primi 24 caratteri dell'hash per creare un ObjectId
    const objectIdHex = hash.substring(0, 24);

    return new ObjectId(objectIdHex);
}

module.exports = {
    insertUserFigurine: insertUserFigurine,
    insertUserFigurines: insertUserFigurines,
    insertUserExchangeableFigurines: insertUserExchangeableFigurines,
    addFigurineDetails: addFigurineDetails,
    getFigurine: getFigurine,
    checkFigurineOnServerStart: checkFigurineOnServerStart,
    pickRandomFigurines: pickRandomFigurines,
}