const express = require('express')
const router = express.Router()
const {verifyToken} = require("../utils/jwtManager");
const authRepository = require('../repository/authRepository')


router.use(verifyToken)

router.get('/', async (req, res) => {
    authRepository.findUserById(req.id).then((user) => res.status(200).json(user))
})

module.exports = router