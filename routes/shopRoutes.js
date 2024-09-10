const express = require('express')
const router = express.Router()
const {verifyToken} = require("../utils/jwtManager");
const marvelService = require('../services/marvelService')
const shopRepository = require("../repository/shopRepository");
const CoinTransaction = require("../model/coinTransaction");
const userRepository = require("../repository/userRepository");
const figurineRepository = require("../repository/figurineRepository")


router.use(verifyToken)


router.get('/availablePacks', (req, res) => {
    console.log('getAvailablePacks')
    shopRepository.getAvailablePacks().then(data => {
        console.log(data)
        res.status(200).json(data)
    }).catch(e => res.status(400).send())
})

router.get('/coinsOffers', (req, res) => {
    console.log('getCoinsOffers')
    shopRepository.getAvailableCoinOffers().then(data => {
        console.log(data)
        res.status(200).json(data)
    }).catch(e => res.status(400).send())
})

router.post('/buyCoin', (req, res) => {
    shopRepository.getCoinOfferById(req.body.coinOfferId).then(coinOffer => {
        const transaction = new CoinTransaction(req.userId, coinOffer.amount, 'Coins bought', new Date())
        shopRepository.addCoinTransaction(transaction).then(result => {
            console.log('entro in addCoinTransaction then')
            if (!result) {
                console.log('entro in addCoinTransaction non c è success')
                res.status(400).json({message: 'Cannot buy coins for internal error'})
                return;
            }
            console.log('entro in addCoinTransaction c è success')
            res.status(200).json({coinAmount: result})
        }).catch(e => {
            console.log('entro in addCoinTransaction catch')
            return res.status(400).json({message: 'Cannot buy coins for internal error'});
        })
    })
})

router.post('/buyPack', (req, res) => {
    userRepository.findUserById(req.userId).then(u => {
        shopRepository.getPackOfferById(req.body.packId).then(async packOffer => {
            console.log('buyPack ci entro')
            if (packOffer.cost > u.coinAmount) {
                console.log('non cie soldi')
                res.status(400).json({message: 'Insufficient funds'})
                return;
            }
            const packId = await shopRepository.createPack(req.userId, packOffer.cardAmount)
            if (packId) {
                await shopRepository.addCoinTransaction(new CoinTransaction(req.userId, -packOffer.cost, 'Pack bought', new Date()))
                console.log('mando packId: ', packId)
                res.status(200).json({packId: packId})
                return
            }
            res.status(500).json({message: 'Internal error'})
        })
    })
})

router.post('/packReedem', (req, res) => {
    userRepository.findUserById(req.userId).then(u => {
        shopRepository.getPackById(req.body.packId).then(async pack => {
            if (!pack) {
                res.status(400).json({message: 'Pack does not exist'})
                return;
            }
            const figurineIds = !pack.figurines ? await figurineRepository.pickRandomFigurines(pack.cardAmount) : pack.figurines
            //const figurineIds = [1011334, 1010672, 1010337, 1010727, 1009696]
            const figurines = []
            for (const id of figurineIds)
                figurines.push(await marvelService.getCharacter(id))

            if (!pack.figurines) {
                pack.figurines = figurineIds
                await shopRepository.updatePack(pack._id, {$set: {figurines: figurineIds}})
            }
            const userFigurines = u.figurine.map(f => f.figurineId)
            figurines.forEach(f => f.owned = userFigurines.includes(f.id))
            res.status(200).json(figurines)
        })
    })
})

router.post('/cardsRedeem', (req, res) => {
    userRepository.findUserById(req.userId).then(u => {
        shopRepository.getPackById(req.body.packId).then(async pack => {
            console.log('========DIOMERDOSOOOO======')
            console.log(JSON.stringify(req.body))
            if (!pack) {
                res.status(400).json({message: 'Pack does not exist'})
                return;
            }
            if (req.body.collection.length !== 0) {
                await figurineRepository.insertUserFigurines(req.userId, req.body.collection)
            }
            if (req.body.discard.length !== 0) {
                for (const f of req.body.discard) {
                    await shopRepository.addCoinTransaction(new CoinTransaction(req.userId, 1, 'Card discard', new Date()));
                }
            }
            if (req.body.trade.length !== 0) {
                await figurineRepository.insertUserExchangeableFigurines(req.userId, u.exchangeable || [], req.body.trade)
            }
            res.status(200).json({message: 'OK'})
        }).catch(_ => res.status(500).json({message: 'Internal error'}))
    }).catch(_ => res.status(500).json({message: 'Internal error'}))
})
module.exports = router