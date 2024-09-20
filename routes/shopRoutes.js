const express = require('express')
const router = express.Router()
const {verifyToken} = require("../utils/jwtManager");
const marvelService = require('../services/marvelService')
const shopRepository = require("../repository/shopRepository");
const CoinTransaction = require("../model/coinTransaction");
const userRepository = require("../repository/userRepository");
const figurineRepository = require("../repository/figurineRepository")
const {onErrorResponse} = require("../utils/ext");

router.use(verifyToken)


router.get('/availablePacks', (req, res) => {
    /**
     * #swagger.tags = ['Shop']
     * #swagger.summary = 'Recupera i pacchetti disponibili'
     * #swagger.description = 'Ritorna una lista di pacchetti disponibili per l acquisto.'
     * #swagger.security = [{
     "cookieAuth": []
     }]
     * #swagger.responses[200] = {
     description: 'Lista dei pacchetti recuperata con successo',
     schema: {
     type: 'array',
     items: {
     type: 'object',
     properties: {
     id: {
     type: 'integer',
     description: 'ID del pacchetto',
     example: 1
     },
     name: {
     type: 'string',
     description: 'Nome del pacchetto',
     example: 'Pacchetto Premium'
     },
     price: {
     type: 'number',
     description: 'Prezzo del pacchetto',
     example: 49.99
     }
     }
     }
     }
     }
     #swagger.responses[400] = {
     description: 'Richiesta non valida (bad request)',
     schema: {
     type: 'object',
     properties: {
     message: {
     type: 'string',
     example: 'Bad request'
     }
     }
     }
     }
     #swagger.responses[500] = {
     description: 'Errore interno del server',
     schema: {
     type: 'object',
     properties: {
     message: {
     type: 'string',
     example: 'Internal server error'
     }
     }
     }
     }
     */
    console.log('getAvailablePacks')
    shopRepository.getAvailablePacks().then(data => {
        console.log(data)
        res.status(200).json(data)
    }).catch(e => onErrorResponse(e, res))
})

router.get('/coinsOffers', (req, res) => {
    /**
     * #swagger.tags = ['Shop']
     * #swagger.summary = 'Recupera le offerte di monete'
     * #swagger.description = 'Ritorna una lista di offerte di monete disponibili per l acquisto.'
     * #swagger.security = [{
     "cookieAuth": []
     }]
     * #swagger.responses[200] = {
     description: 'Lista delle offerte di monete recuperata con successo',
     content: {
     "application/json": {
     schema: {
     type: 'array',
     items: {
     type: 'object',
     properties: {
     id: {
     type: 'integer',
     description: 'ID dell offerta di monete',
     example: 1
     },
     name: {
     type: 'string',
     description: 'Nome dell offerta',
     example: 'Offerta base'
     },
     coinAmount: {
     type: 'integer',
     description: 'Quantità di monete incluse nell offerta',
     example: 100
     },
     price: {
     type: 'number',
     description: 'Prezzo dell offerta',
     example: 9.99
     }
     }
     }
     }
     }
     }
     }
     * #swagger.responses[400] = {
     description: 'Richiesta non valida (bad request)',
     content: {
     "application/json": {
     schema: {
     type: 'object',
     properties: {
     message: {
     type: 'string',
     example: 'Bad request'
     }
     }
     }
     }
     }
     }
     * #swagger.responses[500] = {
     description: 'Errore interno del server',
     content: {
     "application/json": {
     schema: {
     type: 'object',
     properties: {
     message: {
     type: 'string',
     example: 'Internal server error'
     }
     }
     }
     }
     }
     }
     */
    shopRepository.getAvailableCoinOffers().then(data => {
        console.log(data)
        res.status(200).json(data)
    }).catch(e => onErrorResponse(e, res))
})

router.post('/buyCoin', (req, res) => {
    /**
     * #swagger.tags = ['Shop']
     * #swagger.summary = 'Compra un offerta di monete'
     * #swagger.description = 'Permette all utente di acquistare una determinata quantità di monete.'
     * #swagger.security = [{
     "cookieAuth": []
     }]
     * #swagger.parameters['obj'] = {
     in: 'body',
     description: 'ID dell offerta di monete da acquistare (24 caratteri, ID MongoDB)',
     required: true,
     schema: {
     type: 'object',
     properties: {
     coinOfferId: {
     type: 'string',
     example: '507f1f77bcf86cd799439011'
     }
     },
     required: ['coinOfferId']
     }
     }
     * #swagger.responses[200] = {
     description: 'Acquisto completato con successo',
     content: {
     "application/json": {
     schema: {
     type: 'object',
     properties: {
     coinAmount: {
     type: 'integer',
     description: 'Quantità di monete acquistate',
     example: 100
     }
     }
     }
     }
     }
     }
     * #swagger.responses[400] = {
     description: 'Errore nella richiesta o errore interno durante la transazione',
     content: {
     "application/json": {
     schema: {
     type: 'object',
     properties: {
     message: {
     type: 'string',
     description: 'Messaggio di errore',
     example: 'Cannot buy coins for internal error'
     }
     }
     }
     }
     }
     }
     * #swagger.responses[500] = {
     description: 'Errore interno del server',
     content: {
     "application/json": {
     schema: {
     type: 'object',
     properties: {
     message: {
     type: 'string',
     description: 'Messaggio di errore',
     example: 'Internal server error'
     }
     }
     }
     }
     }
     }
     */
    shopRepository.getCoinOfferById(req.body.coinOfferId).then(coinOffer => {
        const transaction = new CoinTransaction(req.userId, coinOffer.amount, 'Coins bought', new Date())
        shopRepository.addCoinTransaction(transaction).then(result => {
            console.log('entro in addCoinTransaction then')
            if (!result) {
                console.log('entro in addCoinTransaction non c è success')
                res.status(400).json({message: 'Cannot buy coins for internal error'})
                return;
            }
            console.log('entro in addCoinTransaction c è success')
            res.status(200).json({coinAmount: result})
        }).catch(e => {
            console.log('entro in addCoinTransaction catch')
            return res.status(400).json({message: 'Cannot buy coins for internal error'});
        })
    })
})

router.post('/buyPack', (req, res) => {
    /**
     * #swagger.tags = ['Shop']
     * #swagger.summary = 'Compra un pacchetto di carte'
     * #swagger.description = 'Permette all\'utente di acquistare un pacchetto di carte se ha abbastanza monete. Riduce la quantità di monete e restituisce l\'ID del pacchetto acquistato.'
     * #swagger.security = [{
     "cookieAuth": []
     }]
     * #swagger.parameters['obj'] = {
     in: 'body',
     description: 'ID del pacchetto di carte da acquistare (24 caratteri, ID MongoDB)',
     required: true,
     schema: {
     type: 'object',
     properties: {
     packId: {
     type: 'string',
     description: 'ID del pacchetto di carte da acquistare',
     example: '507f1f77bcf86cd799439011'
     }
     },
     required: ['packId']
     }
     }
     * #swagger.responses[200] = {
     description: 'Acquisto del pacchetto completato con successo',
     content: {
     "application/json": {
     schema: {
     type: 'object',
     properties: {
     packId: {
     type: 'string',
     description: 'ID del pacchetto acquistato',
     example: '60d5f95f0b8f4c5b8f8d77d3'
     }
     }
     }
     }
     }
     }
     * #swagger.responses[400] = {
     description: 'Errore nella richiesta o fondi insufficienti',
     content: {
     "application/json": {
     schema: {
     type: 'object',
     properties: {
     message: {
     type: 'string',
     description: 'Messaggio di errore',
     example: 'Insufficient funds'
     }
     }
     }
     }
     }
     }
     * #swagger.responses[500] = {
     description: 'Errore interno del server',
     content: {
     "application/json": {
     schema: {
     type: 'object',
     properties: {
     message: {
     type: 'string',
     description: 'Messaggio di errore',
     example: 'Internal error'
     }
     }
     }
     }
     }
     }
     */
    userRepository.findUserById(req.userId).then(u => {
        shopRepository.getPackOfferById(req.body.packId).then(async packOffer => {
            if (packOffer.cost > u.coinAmount) {
                res.status(400).json({message: 'Insufficient funds'})
                return;
            }
            const packId = await shopRepository.createPack(req.userId, packOffer.name, packOffer.cardAmount)
            if (packId) {
                await shopRepository.addCoinTransaction(new CoinTransaction(req.userId, -packOffer.cost, 'Pack bought', new Date()))
                console.log('mando packId: ', packId)
                res.status(200).json({packId: packId})
                return
            }
            res.status(500).json({message: 'Internal error'})
        })
    }).catch(e => onErrorResponse(e))
})

router.put('/packReedem', (req, res) => {
    /**
     * #swagger.tags = ['Shop']
     * #swagger.summary = 'Riscatta un pacchetto di figurine'
     * #swagger.description = 'Permette all\'utente di riscattare un pacchetto di figurine. Restituisce le figurine contenute nel pacchetto, segnando quelle già possedute dall\'utente.'
     * #swagger.security = [{
     "cookieAuth": []
     }]
     * #swagger.parameters['obj'] = {
     in: 'body',
     description: 'ID del pacchetto di figurine da riscattare (24 caratteri, ID MongoDB)',
     required: true,
     schema: {
     type: 'object',
     properties: {
     packId: {
     type: 'string',
     description: 'ID del pacchetto di figurine da riscattare',
     example: '507f1f77bcf86cd799439011'
     }
     },
     required: ['packId']
     }
     }
     * #swagger.responses[200] = {
     description: 'Pacchetto riscattato con successo. Restituisce la lista delle figurine nel pacchetto.',
     content: {
     "application/json": {
     schema: {
     type: 'array',
     items: {
     type: 'object',
     properties: {
     id: {
     type: 'string',
     description: 'ID della figurina',
     example: '1011334'
     },
     name: {
     type: 'string',
     description: 'Nome della figurina',
     example: 'Spider-Man'
     },
     image: {
     type: 'string',
     description: 'URL dell\'immagine della figurina',
     example: 'http://i.annihil.us/u/prod/marvel/i/mg/9/c0/527bb7b37ff55.jpg'
     },
     owned: {
     type: 'boolean',
     description: 'Indica se l\'utente possiede già la figurina',
     example: true
     }
     }
     }
     }
     }
     }
     }
     * #swagger.responses[400] = {
     description: 'Errore nella richiesta, ad esempio, il pacchetto non esiste',
     content: {
     "application/json": {
     schema: {
     type: 'object',
     properties: {
     message: {
     type: 'string',
     description: 'Messaggio di errore',
     example: 'Pack does not exist'
     }
     }
     }
     }
     }
     }
     * #swagger.responses[500] = {
     description: 'Errore interno del server',
     content: {
     "application/json": {
     schema: {
     type: 'object',
     properties: {
     message: {
     type: 'string',
     description: 'Messaggio di errore',
     example: 'Internal server error'
     }
     }
     }
     }
     }
     }
     */
    userRepository.findUserById(req.userId).then(u => {
        shopRepository.getPackById(req.body.packId).then(async pack => {
            if (!pack) {
                res.status(400).json({message: 'Pack does not exist'})
                return;
            }
            const figurineIds = !pack.figurines ? await figurineRepository.pickRandomFigurines(pack.cardAmount) : pack.figurines
            const figurines = []
            for (const id of figurineIds) figurines.push(await marvelService.getCharacter(id))

            if (!pack.figurines) {
                pack.figurines = figurineIds
                await shopRepository.updatePack(pack._id, {$set: {figurines: figurineIds}})
            }
            const userFigurines = u.figurine.map(f => f.figurineId)
            figurines.forEach(f => f.owned = userFigurines.includes(f.id))
            res.status(200).json(figurines)
        }).catch(e => onErrorResponse(e, res))
    }).catch(e => onErrorResponse(e, res))
})

router.post('/cardsRedeem', (req, res) => {
    /**
     #swagger.tags = ['Shop']
     #swagger.summary = 'Smista le figurine a seconda dell\'azione dell\'utente'
     #swagger.description = 'Consente a un utente di marcare i doppioni come scarti ricevendo 1 token per ogni scarto, o di mandare i doppion nella pila degli scambi. Richiede un JWT token per autenticare la richiesta.'
     #swagger.security = [{ "cookieAuth": [] }]

     #swagger.parameters['body'] = {
     in: 'body',
     description: 'Dati per acquistare un pacchetto di figurine',
     required: true,
     schema: {
     type: 'object',
     properties: {
     packId: {
     type: 'integer',
     description: 'ID del pacchetto da acquistare',
     example: 101
     },
     collection: {
     type: 'array',
     items: {
     type: 'integer',
     description: 'ID delle figurine da aggiungere alla collezione'
     },
     description: 'Figurine da aggiungere alla collezione',
     example: [1011334, 1011335]
     },
     discard: {
     type: 'array',
     items: {
     type: 'integer',
     description: 'ID delle figurine da scartare'
     },
     description: 'Figurine da scartare',
     example: [1017100]
     },
     trade: {
     type: 'array',
     items: {
     type: 'integer',
     description: 'ID delle figurine da scambiare'
     },
     description: 'Figurine da rendere disponibili per lo scambio',
     example: [1011336]
     }
     },
     required: ['packId']
     }
     }

     #swagger.responses[200] = {
     description: 'Pacchetto acquistato con successo',
     schema: {
     type: 'object',
     properties: {
     message: {
     type: 'string',
     description: 'Messaggio di successo',
     example: 'OK'
     }
     }
     }
     }

     #swagger.responses[400] = {
     description: 'Errore nella richiesta: pacchetto non esistente',
     schema: {
     type: 'object',
     properties: {
     message: {
     type: 'string',
     description: 'Messaggio di errore',
     example: 'Pack does not exist'
     }
     }
     }
     }

     #swagger.responses[500] = {
     description: 'Errore interno del server',
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
     */

    userRepository.findUserById(req.userId).then(u => {
        shopRepository.getPackById(req.body.packId).then(async pack => {
            console.log(JSON.stringify(req.body))
            if (!pack) {
                res.status(400).json({message: 'Pack does not exist'})
                return;
            }
            if (req.body.collection.length !== 0) {
                await figurineRepository.insertUserFigurines(req.userId, req.body.collection)
            }
            if (req.body.discard.length !== 0) {
                for (const f of req.body.discard) {
                    await shopRepository.addCoinTransaction(new CoinTransaction(req.userId, 1, 'Card discard', new Date()));
                }
            }
            if (req.body.trade.length !== 0) {
                await figurineRepository.insertUserExchangeableFigurines(req.userId, u.exchangeable || [], req.body.trade)
            }
            res.status(200).json({message: 'OK'})
        }).catch(e => onErrorResponse(e, res))
    }).catch(e => onErrorResponse(e, res))
})
module.exports = router