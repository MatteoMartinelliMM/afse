const express = require('express')
const router = express.Router()
const {verifyToken} = require("../utils/jwtManager");
const userRepository = require('../repository/userRepository')
const marvelService = require("../services/marvelService");
const {onErrorResponse} = require("../utils/ext");


router.use(verifyToken)

router.get('/info', async (req, res) => {
    /**
     * #swagger.tags = ['User']
     * #swagger.summary = 'Recupera le info utente'
     * #swagger.description = 'Ritorna le informazioni relative al profilo dell utente autenticato. Richiede un JWT token passato tramite cookie.'
     * #swagger.security = [{
     "cookieAuth": []
     }]
     * #swagger.responses[200] = {
     description: 'Profilo utente recuperato con successo',
     schema: {
     type: 'object',
     properties: {
     _id: {
     type: 'object',
     properties: {
     $oid: {
     type: 'string',
     description: 'L ID dell utente',
     example: '66dc65c5da63d679f7133e3c'
     }
     }
     },
     name: {
     type: 'string',
     description: 'Nome dell utente',
     example: 'g'
     },
     surname: {
     type: 'string',
     description: 'Cognome dell utente',
     example: 'g'
     },
     username: {
     type: 'string',
     description: 'Username dell utente',
     example: 'g'
     },
     email: {
     type: 'string',
     description: 'Email dell utente',
     example: 'g@example.com'
     },
     pwd: {
     type: 'string',
     description: 'Password hash dell utente',
     example: 'cd0aa9856147b6c5b4ff2b7dfee5da20aa38253099ef1b4a64aced233c9afe29'
     },
     isHero: {
     type: 'boolean',
     description: 'Indica se l utente è un supereroe',
     example: true
     },
     favouriteHero: {
     type: 'object',
     properties: {
     favouriteHeroId: {
     type: 'integer',
     description: 'ID del supereroe preferito',
     example: 1011334
     },
     favouriteHeroName: {
     type: 'string',
     description: 'Nome del supereroe preferito',
     example: 'Spider-Man'
     },
     favouriteHeroImage: {
     type: 'string',
     description: 'URL dell immagine del supereroe preferito',
     example: 'http://i.annihil.us/u/prod/marvel/i/mg/9/c0/527bb7b37ff55.jpg'
     }
     }
     },
     profilePicture: {
     type: 'string',
     description: 'URL dell immagine del profilo dell utente',
     example: 'http://i.annihil.us/u/prod/marvel/i/mg/9/c0/527bb7b37ff55.jpg'
     },
     coinAmount: {
     type: 'integer',
     description: 'Numero di monete dell utente',
     example: 9
     }
     }
     }
     }
     * #swagger.responses[401] = {
     description: 'Utente non autenticato o JWT token mancante'
     }
     */
    userRepository.findUserById(req.userId)
        .then((user) => res.status(200).json(user))
        .catch(e => onErrorResponse(e, res))
})

router.get('/profile', (req, res) => {
    /**
     * #swagger.tags = ['User']
     * #swagger.summary = 'Recupera il profilo utente'
     * #swagger.description = 'Ritorna le informazioni relative al profilo dell utente autenticato. Richiede un JWT token passato tramite cookie.'
     * #swagger.security = [{
     "cookieAuth": []
     }]
     * #swagger.responses[200] = {
     description: 'Profilo utente recuperato con successo',
     schema: {
     type: 'object',
     properties: {
     _id: {
     type: 'object',
     properties: {
     $oid: {
     type: 'string',
     description: 'L ID dell utente',
     example: '66dc65c5da63d679f7133e3c'
     }
     }
     },
     name: {
     type: 'string',
     description: 'Nome dell utente',
     example: 'g'
     },
     surname: {
     type: 'string',
     description: 'Cognome dell utente',
     example: 'g'
     },
     username: {
     type: 'string',
     description: 'Username dell utente',
     example: 'g'
     },
     email: {
     type: 'string',
     description: 'Email dell utente',
     example: 'g@example.com'
     },
     pwd: {
     type: 'string',
     description: 'Password hash dell utente',
     example: 'cd0aa9856147b6c5b4ff2b7dfee5da20aa38253099ef1b4a64aced233c9afe29'
     },
     isHero: {
     type: 'boolean',
     description: 'Indica se l utente è un supereroe',
     example: true
     },
     favouriteHero: {
     type: 'object',
     properties: {
     favouriteHeroId: {
     type: 'integer',
     description: 'ID del supereroe preferito',
     example: 1011334
     },
     favouriteHeroName: {
     type: 'string',
     description: 'Nome del supereroe preferito',
     example: 'Spider-Man'
     },
     favouriteHeroImage: {
     type: 'string',
     description: 'URL dell immagine del supereroe preferito',
     example: 'http://i.annihil.us/u/prod/marvel/i/mg/9/c0/527bb7b37ff55.jpg'
     }
     }
     },
     profilePicture: {
     type: 'string',
     description: 'URL dell immagine del profilo dell utente',
     example: 'http://i.annihil.us/u/prod/marvel/i/mg/9/c0/527bb7b37ff55.jpg'
     },
     coinAmount: {
     type: 'integer',
     description: 'Numero di monete dell utente',
     example: 9
     }
     }
     }
     }
     * #swagger.responses[401] = {
     description: 'Utente non autenticato o JWT token mancante'
     }
     */

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
    /**
     * #swagger.tags = ['User']
     * #swagger.summary = 'Cambia il supereroe preferito dell utente'
     * #swagger.description = 'Permette di cambiare il supereroe preferito dell utente autenticato. Richiede un JWT token passato tramite cookie e l ID del supereroe nel body della richiesta.'
     * #swagger.security = [{
     "cookieAuth": []
     }]
     * #swagger.parameters['obj'] = {
     in: 'body',
     description: 'ID del nuovo supereroe preferito',
     required: true,
     schema: {
     type: 'object',
     properties: {
     id: {
     type: 'integer',
     description: 'ID del nuovo supereroe preferito',
     example: 1011334
     }
     }
     }
     }
     * #swagger.responses[200] = {
     description: 'Utente aggiornato con successo',
     schema: {
     type: 'object',
     properties: {
     message: {
     type: 'string',
     description: 'Messaggio di conferma',
     example: 'User updated successfully'
     }
     }
     }
     }
     * #swagger.responses[404] = {
     description: 'Supereroe non trovato',
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
     * #swagger.responses[401] = {
     description: 'Utente non autenticato o JWT token mancante'
     }
     */
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

module.exports = router