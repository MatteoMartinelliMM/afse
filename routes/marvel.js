const express = require('express')
const router = express.Router()
const {verifyToken} = require("../utils/jwtManager");
const marvelService = require('../services/marvelService')
const authRepository = require("../repository/userRepository");
const figurineRepository = require("../repository/figurineRepository")
const userRepository = require("../repository/userRepository")
const Figurine = require("../model/figurine");


router.get('/characters/:name', (req, res) => {
    const name = req.params.name
    marvelService.getCharactersStartsWithName(name)
        .then((characters) => res.status(200).json(characters))
        .catch(e => res.status(400).json({}))
})

router.use(verifyToken)

router.get('/aggiungi', (req, res) => {
    authRepository.findUserById(req.userId).then(async (u) => {
        await figurineRepository.insertUserFigurine(u._id, new Figurine(1010672, 'Amora'))
        res.send(200)
    })
})

router.get('/characters', (req, res) => {
    const page = req.query.page || 1
    marvelService.getCharacters(page).then(async (data) => {
        if (data) {
            console.log('mando risposta json')
            data = await figurineRepository.addFigurineDetails(data, req.userId)
            res.status(200).json(data)
            return
        }
        res.status(400).json({message: 'Marvel does not respond'})
    }).catch((e) => console.error(e))
})

router.get('/character', async (req, res) => {
    const id = req.query.id
    if (!id) {
        res.send(400).json({message: 'missing character id'})
        return;
    }
    const figurineId = parseInt(id)
    const getFigurine =
        figurineRepository.getFigurine(req.userId, figurineId).then(figurine => ({
            status: 'fulfilled',
            value: figurine
        })).catch(error => ({status: 'error', reason: error}))

    const getCharacter = marvelService.getCharacter(id).then(data => ({
        status: 'fulfilled',
        value: data
    })).catch((e) => ({status: 'error', reason: e}))
    const results = await Promise.allSettled([getFigurine, getCharacter])
    const dbRes = results[0]
    const apiRes = results[1]
    if (dbRes.status === 'fulfilled' && apiRes.status === 'fulfilled') {
        console.log('mando risposta json')
        res.status(200).json({
            ...apiRes.value.value,
            figurineQuantity: dbRes.value.value.figurine[0].quantity,
            figurineLevel: dbRes.value.value.figurine[0].level,
        })
        return
    }
    res.status(400).json({message: 'Marvel does not respond'})
})

router.get('/heroDetail', async (req, res) => {
    const path = req.query.path
    if (!path) {
        res.send(400).json({message: 'missing character id'})
        return;
    }

    marvelService.getHeroDetail(path).then(data => {
        if (!data) {
            res.status(400).json({message: 'Marvel does not respond'})
            return;
        }
        res.status(200).json(data)
    }).catch(e => res.status(400).json({message: 'Marvel does not respond'}))
})

router.get('/charactersTrade/:name', (req, res) => {
    const name = req.params.name
    Promise.allSettled([marvelService.getCharactersStartsWithName(name), userRepository.findUserById(req.userId)])
        .then(result => {
            const characters = result[0].value
            const user = result[1].value
            if (characters && user) {
                const userCards = [...user.figurine.map(f => f.figurineId),
                    ...user.exchangeable.map(f => f.figurineId)]
                res.status(200).json(characters.filter(c => !userCards.includes(c.id)))
                return;
            }
            res.status(200).json({message: 'Error fetching data'})
        })

})

module.exports = router
