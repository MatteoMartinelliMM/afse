const express = require('express')
const router = express.Router()
const authRepository = require('../repository/userRepository')
const jwtManager = require("../utils/jwtManager");
const marvelService = require('../services/marvelService.js')
const {User} = require("../model/user");

router.get('/register', async (req, res) => {
    console.log('ci arrivo')
    let c = await marvelService.getCharacters();
    console.log('Spalletti merda')
    console.log(c)
    res.status(200).send()
})

router.post('/register', (req, res) => {
    console.log('dio')
    let u = new User(req.body);
    if (u.isValidUser()) {//todo aggiungere controllo password
        authRepository.insertUser(u).then(async insert => {
            if (!insert) {
                res.status(400).json({message: 'bad request'})
                return;
            }
            const token = await jwtManager.getToken(u._id)
            res.cookie('jwt', token, {
                //expires: new Date(new Date().getTime() + 15 * 60000),   // 15 minutes
                httpOnly: true,  // Allow client-side access to the cookie
                secure: false,
                sameSite: true,// Set to true if using HTTPS
                path: '/'         // Cookie available on all routes
            });
            console.log('arrivo qua eh!')
            res.status(200).json({'result': 'ok'}).send()
        })
    }

})

router.post('/login', async (req, res) => {
    let login = req.body;
    console.log(process.env.TZ)
    console.log(new Date())
    if (login.email && login.pwd && login.pwd.length > 0) {
        const user = await authRepository.findUserByCredentials(login)
        if (user) {
            const token = await jwtManager.getToken(user._id)
            res.cookie('jwt', token, {
                //expires: new Date(new Date().getTime() + 15 * 60000),   // 15 minutes
                httpOnly: true,  // Allow client-side access to the cookie
                secure: false,
                sameSite: true,// Set to true if using HTTPS
                path: '/'         // Cookie available on all routes
            });
            res.status(200).send()
            return;
        }
        res.status(400).json({message: 'Invalid username or password'})
    }
    res.status(400).json({message: 'bad request'})
})

router.get('/', async (req, res) => {
    let users = await authRepository.findAllUsers()
    res.status(200).json(users)
});

router.get('/:id', async (req, res) => {
    let u = await authRepository.findUserById(req.params.id)
    res.status(u ? 200 : 404).json(u ? u : {message: 'User not found'})
});

router.delete('/:id', async (req, res) => {
    let result = await authRepository.deleteUserById(req.params.id)
    res.status(result ? 200 : 400).json({message: result ? 'User deleted successfully' : 'User not found'})
})

module.exports = router;