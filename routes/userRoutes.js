const express = require('express')
const router = express.Router()
const {verifyToken} = require("../utils/jwtManager");
const userRepository = require('../repository/userRepository')


router.use(verifyToken)

router.get('/info', async (req, res) => {
    userRepository.findUserById(req.userId)
        .then((user) => res.status(200).json(user))
        .catch(e => res.status(400).json({message: 'An error occured'}))
})

module.exports = router