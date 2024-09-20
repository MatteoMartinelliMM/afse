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
    /**
     * #swagger.tags = ['Auth']
     * #swagger.description = 'Endpoint per registrare un nuovo utente'
     * #swagger.parameters['obj'] = {
     in: 'body',
     description: 'User information',
     required: true,
     schema: {
     type: 'object',
     properties: {
     nome: {
     type: 'string',
     description: 'Nome dell utente',
     example: 'Mario'
     },
     cognome: {
     type: 'string',
     description: 'Cognome dell utente',
     example: 'Rossi'
     },
     username: {
     type: 'string',
     description: 'Username dell utente',
     example: 'mrossi'
     },
     email: {
     type: 'string',
     description: 'Email dell utente',
     example: 'mario.rossi@example.com'
     },
     password: {
     type: 'string',
     description: 'Password dell utente',
     example: 'password123'
     },
     profilePicture: {
     type: 'string',
     description: 'URL dell immagine del profilo',
     example: 'https://example.com/profile/mrossi.png'
     },
     favouriteHero: {
     type: 'integer',
     description: 'ID del supereroe preferito dell utente',
     example: 1
     }
     }
     }
     }
     * #swagger.responses[200] = {
     description: 'Ok'
     }
     * #swagger.responses[400] = {
     description: 'Bad request'
     }
     * #swagger.responses[409] = {
     description: 'Email/Username already exist.'
     }
     * #swagger.security = [{
     "apiKeyAuth": []
     }]
     */
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
            res.status(200).json({result: 'ok'}).send()
        }).catch(e => {
            console.log(e)
            const keyPattern = e.keyPattern
            res.status(409).json({message: `${Object.keys(keyPattern)[0].capitalize()} already exist.`})
        })
    }

})

router.post('/login', async (req, res) => {
    /**
     * #swagger.tags = ['Auth']
     * #swagger.description = 'Effettua il login'
     * #swagger.parameters['obj'] = {
     in: 'body',
     description: 'Login credentials',
     required: true,
     schema: {
     type: 'object',
     properties: {
     email: {
     type: 'string',
     example: 'user@example.com'
     },
     password: {
     type: 'string',
     example: 'password123'
     }
     }
     }
     }
     * #swagger.responses[200] = {
     description: 'Login ok'
     }
     * #swagger.responses[400] = {
     description: 'Bad request'
     }
     * #swagger.responses[403] = {
     description: 'Invalid username or password'
     }
     * #swagger.security = [{
     "apiKeyAuth": []
     }]
     */
    let login = req.body;
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
        res.status(403).json({message: 'Invalid username or password'})
        return;
    }
    res.status(400).json({message: 'bad request'})
})

router.use(verifyToken)

router.post('/logout', (req, res) => {
    /**
     * #swagger.tags = ['Auth']
     * #swagger.summary = 'Effettua il logout dell utente'
     * #swagger.description = 'Effettua il logout dell utente autenticato e invalida il JWT token. Richiede un JWT token passato tramite cookie.'
     * #swagger.security = [{
     "cookieAuth": []
     }]
     * #swagger.responses[200] = {
     description: 'Logout effettuato con successo',
     schema: {
     type: 'object',
     properties: {
     message: {
     type: 'string',
     description: 'Messaggio di conferma',
     example: 'Successfully logged out'
     }
     }
     }
     }
     * #swagger.responses[401] = {
     description: 'Utente non autenticato o JWT token mancante'
     }
     */

    res.cookie('jwt', '', {
        expires: new Date(0), httpOnly: true,  // Allow client-side access to the cookie
        secure: false, sameSite: true,// Set to true if using HTTPS
        path: '/'         // Cookie available on all routes
    });
    res.status(200).json({message: 'Successfully logged out'});
})


router.delete('/deleteAccount', (req, res) => {
    /**
     * #swagger.tags = ['Auth']
     * #swagger.summary = 'Elimina l account dell utente'
     * #swagger.description = 'Elimina l account dell utente autenticato. L ID dell utente è preso dal JWT token passato tramite cookie.'
     * #swagger.security = [{
     "cookieAuth": []
     }]
     * #swagger.responses[200] = {
     description: 'Account dell utente eliminato con successo',
     schema: {
     type: 'object',
     properties: {
     message: {
     type: 'string',
     description: 'Messaggio di conferma',
     example: 'User deleted successfully'
     }
     }
     }
     }
     * #swagger.responses[404] = {
     description: 'Utente non trovato',
     schema: {
     type: 'object',
     properties: {
     message: {
     type: 'string',
     description: 'Messaggio di errore',
     example: 'Not found'
     }
     }
     }
     }
     * #swagger.responses[500] = {
     description: 'Impossibile completare la richiesta',
     schema: {
     type: 'object',
     properties: {
     message: {
     type: 'string',
     description: 'Messaggio di errore',
     example: 'Cannot perform request'
     }
     }
     }
     }
     * #swagger.responses[401] = {
     description: 'Utente non autenticato o JWT token mancante'
     }
     */

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