const express = require('express')
const router = express.Router()
const {verifyToken} = require("../utils/jwtManager");
const userRepository = require('../repository/userRepository')
const marvelService = require("../services/marvelService");
const figurineRepository = require("../repository/figurineRepository")


router.use(verifyToken)

router.get('/user', (req, res) => {
    userRepository.findUserById(req.userId).then(user => {
        res.status(200).json(user)
    }).catch(e => {
        console.log(e)
        res.status(500).json({message: "Cannot perform request"})
    })
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
    }).catch(e => {
        console.log(e)
        res.status(500).json({message: "Cannot perform request"})
    })
})

module.exports = router