const express = require('express')
const router = express.Router()
const userRepository = require('../repository/userRepository')
const marketRepository = require('../repository/marketRepository')
const shopRepository = require('../repository/shopRepository')
const jwtManager = require("../utils/jwtManager");
require('../services/marvelService.js');
const {User} = require("../model/user");
const {verifyToken} = require("../utils/jwtManager");
const marvelService = require("../services/marvelService");
const {onErrorResponse} = require("../utils/ext");


router.post('/register', (req, res) => {
    console.log('dio')
    let u = new User(req.body);
    if (u.isValidUser()) {//todo aggiungere controllo password
        userRepository.insertUser(u).then(async insert => {
            if (!insert) {
                res.status(400).json({message: 'bad request'})
                return;
            }
            const token = await jwtManager.getToken(insert)
            res.cookie('jwt', token, {
                expires: new Date(new Date().getTime() + 60 * 60000),   // 60 minutes
                httpOnly: true,  // Allow client-side access to the cookie
                secure: false, sameSite: true,// Set to true if using HTTPS
                path: '/'         // Cookie available on all routes
            });
            console.log('arrivo qua eh!')
            res.status(200).json({result: 'ok'}).send()
        }).catch(e => {
            console.log(e)
            const keyPattern = e.keyPattern
            res.status(400).json({message: `${Object.keys(keyPattern)[0].capitalize()} already exist.`})
        })
    }

})

router.post('/login', async (req, res) => {
    let login = req.body;
    console.log(process.env.TZ)
    console.log(new Date())
    if (login.email && login.pwd && login.pwd.length > 0) {
        const user = await userRepository.findUserByCredentials(login)
        if (user) {
            const token = await jwtManager.getToken(user._id.toString())
            res.cookie('jwt', token, {
                expires: new Date(new Date().getTime() + 60 * 60000),   // 60 minutes
                httpOnly: true,  // Allow client-side access to the cookie
                secure: false, sameSite: true,// Set to true if using HTTPS
                path: '/'         // Cookie available on all routes
            });
            res.status(200).json({message: 'Login ok'})
            return;
        }
        res.status(400).json({message: 'Invalid username or password'})
        return;
    }
    res.status(403).json({message: 'bad request'})
})

router.use(verifyToken)

router.get('/profile', (req, res) => {
    userRepository.findUserById(req.userId).then(user => {
        marvelService.getCharacter(user.favouriteHero).then(h => {
            user.favouriteHero = {
                favouriteHeroId: h.id,
                favouriteHeroName: h.name,
                favouriteHeroImage: `${h.thumbnail.path}.${h.thumbnail.extension}`
            }
            console.log(JSON.stringify(user, null, 2))
            res.status(200).json(user)
        }).catch(e => onErrorResponse(e, res))
    }).catch(e => onErrorResponse(e, res))
})

router.put('/changeFavouriteHero', (req, res) => {
    marvelService.getCharacter(req.body.id).then(hero => {
        userRepository.updateUserById(req.userId, {
            favouriteHero: hero.id, profilePicture: `${hero.thumbnail.path}.${hero.thumbnail.extension}`
        })
            .then(result => {
                if (result) {
                    res.status(200).json({message: 'User updated successfully'})
                    return;
                }
                res.status(500).json({message: 'Cannot perform request'})
            }).catch(e => onErrorResponse(e, res))
    }).catch(e => onErrorResponse(e, res))
})

router.post('/logout', (req, res) => {
    res.cookie('jwt', '', {
        expires: new Date(0), httpOnly: true,  // Allow client-side access to the cookie
        secure: false, sameSite: true,// Set to true if using HTTPS
        path: '/'         // Cookie available on all routes
    });
    res.status(200).json({message: 'Successfully logged out'});
})

router.delete('/deleteAccount', (req, res) => {
    userRepository.findUserById(req.userId).then(user => {
        userRepository.deleteUserById(req.userId).then(result => {
            if (!result) {
                res.status(500).json({message: 'Cannot perform request'})
                return
            }
            Promise.allSettled([marketRepository.deleteInTradeOffersByUserId(req.userId), shopRepository.deletePacksByUserId(req.userId)])
                .then(async results => {
                    if (results.some(r => !r.value)) {
                        await userRepository.insertUser(user)
                        res.status(500).json({message: 'Cannot perform request'})
                        return;
                    }
                    res.status(200).json({message: 'User deleted successfully'})
                })
        }).catch(e => onErrorResponse(e, res))
    }).catch(e => onErrorResponse(e, res))
})

module.exports = router;