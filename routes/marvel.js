const express = require('express')
const router = express.Router()
const {verifyToken} = require("../utils/jwtManager");
const marvelService = require('../services/marvelService')


router.get('/characters/:name', (req, res) => {
    const name = req.params.name
    marvelService.getCharactersStartsWithName(name)
        .then((characters) => res.status(200).json(characters))
        .catch((e) => res.status(400).json({}))
})

router.use(verifyToken)

module.exports = router
