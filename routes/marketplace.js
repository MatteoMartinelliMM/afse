const express = require('express')
const router = express.Router()
const {verifyToken} = require("../utils/jwtManager");
const userRepository = require('../repository/userRepository')
const marketRepository = require('../repository/marketRepository')
const marvelService = require("../services/marvelService");


router.use(verifyToken)

router.get('/offers', async (req, res) => {
    userRepository.findUserById(req.userId)
        .then(async u => {
            const marketOffers = await marketRepository.getMarketOfferByUserId(req.userId)
            const exchangeableIds = u.exchangeable?.map(f => f.figurineId) || []
            const marketOffersIds = marketOffers?.map(f => f.figurineId) || []
            const exchangeable = []
            const offers = []
            for (const id of exchangeableIds) {
                const h = await marvelService.getCharacter(id)
                h.quantity = u.exchangeable.find(f => f.figurineId === id).quantity;
                exchangeable.push(h)
            }
            for (const id of marketOffersIds)
                offers.push(await marvelService.getCharacter(id))
            res.status(200).json({exchangeable: exchangeable, offers: offers})
        }).catch(e => {
        console.log(e)
        return res.status(400).json({message: 'An error occured'});
    })
})

router.put('/createOffer', (req, res) => {
    userRepository.findUserById(req.userId)
        .then(u => {
            console.log('ciao')
            console.log(JSON.stringify(req.body))
            res.status(200).json({message: 'ok'})
        }).catch(e => res.status(500).json({message: 'cannot perform request'}))
})

module.exports = router