const express = require('express')
const router = express.Router()
const {verifyToken} = require("../utils/jwtManager");
const userRepository = require('../repository/userRepository')
const marvelService = require("../services/marvelService");
const figurineRepository = require("../repository/figurineRepository")
const marketRepository = require("../repository/marketRepository")
const {onErrorResponse} = require("../utils/ext");


router.use(verifyToken)

router.get('/user', (req, res) => {
    userRepository.findUserById(req.userId).then(user => {
        res.status(200).json(user)
    }).catch(e => onErrorResponse(e, res))
})

router.get('/collection/:page', (req, res) => {
    const page = req.params.page || 1
    figurineRepository.getUserFigurinePaginated(req.userId, page).then(figurines => {
        figurines.page = parseInt(page)
        figurines.totalPages = Math.ceil(figurines.total / 6)
        console.log(JSON.stringify(figurines, null, 2))
        Promise.allSettled(figurines.figurine.map(e => marvelService.getCharacter(e.figurineId)))
            .then(results => {
                results.forEach(r => {
                    if (r.value) {
                        const h = r.value
                        const figurine = figurines.figurine.find(f => f.figurineId === h.id)
                        figurine.imageUrl = `${h.thumbnail.path}.${h.thumbnail.extension}`;
                    }
                })
                res.status(200).json(figurines)
            })
    }).catch(e => onErrorResponse(e, res))
})

router.get('/openedPacks', (req, res) => {
    console.log('openedPacks')
    userRepository.findUserById(req.userId).then(user => {
        const userFigurinesIds = user.figurine.map(f => f.figurineId)
        figurineRepository.getUserLastPackOpened(req.userId)
            .then(async packs => {
                for (const p of packs) {
                    const results = await Promise.allSettled(p.figurines.map(id => marvelService.getCharacter(id)))
                    results.forEach(r => {
                        if (r.value) {
                            const card = r.value;
                            const index = p.figurines.findIndex(id => card.id === id);  // Trova l'indice dell'ID
                            if (index !== -1) {
                                p.figurines[index] = {
                                    id: card.id,
                                    name: card.name,
                                    imageUrl: `${card.thumbnail.path}.${card.thumbnail.extension}`,
                                    owned: userFigurinesIds.includes(card.id)
                                };
                            }
                        }
                    })
                }
                console.log(JSON.stringify(packs, null, 2))
                res.status(200).json(packs)
            })
            .catch(e => onErrorResponse(e, res))
    }).catch(e => onErrorResponse(e, res))

})

router.get('/recentDeals', (req, res) => {
    marketRepository.getRecentDeals().then(deals => {
        const usersIds = [...new Set(deals.reduce((acc, d) => acc.concat([d.receiver, d.bidder]), []))];
        userRepository.findUserByIds(usersIds).then(async users => {
            for (const d of deals) {
                const bidder = users.find(u => u._id.toString() === d.bidder)
                const receiver = users.find(u => u._id.toString() === d.receiver)
                d.bidderImage = bidder?.profilePicture || ''
                d.bidderUsername = bidder?.username || ''
                d.receiverImage = receiver?.profilePicture || ''
                d.receiverUsername = receiver?.username || ''
                const receiveResults = await Promise.allSettled(d.receiveCard.map(id => marvelService.getCharacter(id)))
                receiveResults.forEach(r => {
                    if (r.value) {
                        const h = r.value
                        d.receiveCard[d.receiveCard.findIndex(id => h.id === id)] = {
                            name: h.name,
                            id: h.id,
                            imageUrl: `${h.thumbnail.path}.${h.thumbnail.extension}`
                        }
                    }
                })
                const giveResults = await Promise.allSettled(d.giveCard.map(id => marvelService.getCharacter(id)))
                giveResults.forEach(r => {
                    if (r.value) {
                        const h = r.value
                        d.giveCard[d.giveCard.findIndex(id => h.id === id)] = {
                            name: h.name,
                            id: h.id,
                            imageUrl: `${h.thumbnail.path}.${h.thumbnail.extension}`
                        }
                    }
                })
            }
            console.log(JSON.stringify(deals, null, 2))
            res.status(200).json(deals)
        }).catch(e => onErrorResponse(e, res))
    }).catch(e => onErrorResponse(e, res))
})

module.exports = router