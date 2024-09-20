const express = require('express')
const router = express.Router()
const {verifyToken} = require("../utils/jwtManager");
const userRepository = require('../repository/userRepository')
const marvelService = require("../services/marvelService");
const figurineRepository = require("../repository/figurineRepository")
const marketRepository = require("../repository/marketRepository")
const {onErrorResponse} = require("../utils/ext");


router.use(verifyToken)

router.get('/collection/:page', (req, res) => {
    /**
     #swagger.tags = ['Home']
     #swagger.summary = 'Recupera la collezione di figurine dell\'utente'
     #swagger.description = 'Recupera le figurine dell\'utente con paginazione. Richiede un JWT token per autenticare la richiesta.'
     #swagger.security = [{ "cookieAuth": [] }]
     #swagger.parameters['page'] = {
     in: 'path',
     description: 'Numero della pagina della collezione di figurine da recuperare',
     required: true,
     type: 'integer',
     example: 1
     }
     #swagger.responses[200] = {
     description: 'Collezione di figurine recuperata con successo',
     schema: {
     type: 'object',
     properties: {
     page: {
     type: 'integer',
     description: 'Numero della pagina corrente',
     example: 1
     },
     totalPages: {
     type: 'integer',
     description: 'Numero totale di pagine',
     example: 5
     },
     figurine: {
     type: 'array',
     items: {
     type: 'object',
     properties: {
     figurineId: {
     type: 'string',
     description: 'ID della figurina',
     example: '1011334'
     },
     imageUrl: {
     type: 'string',
     description: 'URL dell\'immagine della figurina',
     example: 'http://example.com/image.jpg'
     }
     }
     },
     description: 'Lista delle figurine dell\'utente'
     },
     total: {
     type: 'integer',
     description: 'Numero totale di figurine dell\'utente',
     example: 30
     }
     }
     }
     }
     #swagger.responses[500] = {
     description: 'Internal server error',
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
     */
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
    }).catch(e => onErrorResponse(e, res))
})

router.get('/openedPacks', (req, res) => {
    /**
     #swagger.tags = ['Home']
     #swagger.summary = 'Recupera i pacchetti aperti dall\'utente'
     #swagger.description = 'Recupera i dettagli dei pacchetti di figurine aperti dall\'utente, includendo informazioni sulle figurine contenute. Richiede un JWT token per autenticare la richiesta.'
     #swagger.security = [{ "cookieAuth": [] }]
     #swagger.responses[200] = {
     description: 'Pacchetti aperti recuperati con successo',
     schema: {
     type: 'array',
     items: {
     type: 'object',
     properties: {
     _id: {
     type: 'string',
     description: 'ID del pacchetto',
     example: '60d5ecb54899f48c5b9d7e1a'
     },
     userId: {
     type: 'string',
     description: 'ID dell\'utente che ha aperto il pacchetto',
     example: '60d5ecb54899f48c5b9d7e1b'
     },
     openedAt: {
     type: 'string',
     format: 'date-time',
     description: 'Data e ora di apertura del pacchetto',
     example: '2023-09-19T14:30:00Z'
     },
     figurines: {
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
     description: 'Nome del personaggio',
     example: 'Spider-Man'
     },
     imageUrl: {
     type: 'string',
     description: 'URL dell\'immagine della figurina',
     example: 'http://example.com/spider-man.jpg'
     },
     owned: {
     type: 'boolean',
     description: 'Indica se l\'utente possiede già questa figurina',
     example: true
     }
     }
     },
     description: 'Lista delle figurine contenute nel pacchetto'
     }
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
     example: 'Internal server error'
     }
     }
     }
     }
     */
    userRepository.findUserById(req.userId).then(user => {
        const userFigurinesIds = user.figurine.map(f => f.figurineId)
        figurineRepository.getUserLastPackOpened(req.userId)
            .then(async packs => {
                for (const p of packs) {
                    const results = await Promise.allSettled(p.figurines.map(id => marvelService.getCharacter(id)))
                    results.forEach(r => {
                        if (r.value) {
                            const card = r.value;
                            const index = p.figurines.findIndex(id => card.id === id);  // Trova l'indice dell'ID
                            if (index !== -1) {
                                p.figurines[index] = {
                                    id: card.id,
                                    name: card.name,
                                    imageUrl: `${card.thumbnail.path}.${card.thumbnail.extension}`,
                                    owned: userFigurinesIds.includes(card.id)
                                };
                            }
                        }
                    })
                }
                console.log(JSON.stringify(packs, null, 2))
                res.status(200).json(packs)
            })
            .catch(e => onErrorResponse(e, res))
    }).catch(e => onErrorResponse(e, res))
})

router.get('/recentDeals', (req, res) => {
    /**
     #swagger.tags = ['Home']
     #swagger.summary = 'Recupera gli scambi recenti'
     #swagger.description = 'Recupera i dettagli delle transazioni (deal) recenti nel mercato, includendo informazioni sugli utenti coinvolti e le carte scambiate.'
     #swagger.security = [{ "cookieAuth": [] }]
     #swagger.responses[200] = {
     description: 'Deal recenti recuperati con successo',
     schema: {
     type: 'array',
     items: {
     type: 'object',
     properties: {
     _id: {
     type: 'string',
     description: 'ID del deal',
     example: '60d5ecb54899f48c5b9d7e1a'
     },
     bidder: {
     type: 'string',
     description: 'ID dell\'utente che ha fatto l\'offerta',
     example: '60d5ecb54899f48c5b9d7e1b'
     },
     receiver: {
     type: 'string',
     description: 'ID dell\'utente che ha ricevuto l\'offerta',
     example: '60d5ecb54899f48c5b9d7e1c'
     },
     bidderImage: {
     type: 'string',
     description: 'URL dell\'immagine del profilo dell\'offerente',
     example: 'http://example.com/user1.jpg'
     },
     bidderUsername: {
     type: 'string',
     description: 'Nome utente dell\'offerente',
     example: 'user1'
     },
     receiverImage: {
     type: 'string',
     description: 'URL dell\'immagine del profilo del ricevente',
     example: 'http://example.com/user2.jpg'
     },
     receiverUsername: {
     type: 'string',
     description: 'Nome utente del ricevente',
     example: 'user2'
     },
     receiveCard: {
     type: 'array',
     items: {
     type: 'object',
     properties: {
     id: {
     type: 'string',
     description: 'ID della carta ricevuta',
     example: '1011334'
     },
     name: {
     type: 'string',
     description: 'Nome del personaggio della carta ricevuta',
     example: 'Spider-Man'
     },
     imageUrl: {
     type: 'string',
     description: 'URL dell\'immagine della carta ricevuta',
     example: 'http://example.com/spider-man.jpg'
     }
     }
     },
     description: 'Lista delle carte ricevute nel deal'
     },
     giveCard: {
     type: 'array',
     items: {
     type: 'object',
     properties: {
     id: {
     type: 'string',
     description: 'ID della carta data',
     example: '1009220'
     },
     name: {
     type: 'string',
     description: 'Nome del personaggio della carta data',
     example: 'Captain America'
     },
     imageUrl: {
     type: 'string',
     description: 'URL dell\'immagine della carta data',
     example: 'http://example.com/captain-america.jpg'
     }
     }
     },
     description: 'Lista delle carte date nel deal'
     },
     createdAt: {
     type: 'string',
     format: 'date-time',
     description: 'Data e ora di creazione del deal',
     example: '2023-09-19T14:30:00Z'
     }
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
     example: 'Internal server error'
     }
     }
     }
     }
     */
    marketRepository.getRecentDeals().then(deals => {
        const usersIds = [...new Set(deals.reduce((acc, d) => acc.concat([d.receiver, d.bidder]), []))];
        userRepository.findUserByIds(usersIds).then(async users => {
            for (const d of deals) {
                const bidder = users.find(u => u._id.toString() === d.bidder)
                const receiver = users.find(u => u._id.toString() === d.receiver)
                d.bidderImage = bidder?.profilePicture || ''
                d.bidderUsername = bidder?.username || ''
                d.receiverImage = receiver?.profilePicture || ''
                d.receiverUsername = receiver?.username || ''
                const receiveResults = await Promise.allSettled(d.receiveCard.map(id => marvelService.getCharacter(id)))
                receiveResults.forEach(r => {
                    if (r.value) {
                        const h = r.value
                        d.receiveCard[d.receiveCard.findIndex(id => h.id === id)] = {
                            name: h.name,
                            id: h.id,
                            imageUrl: `${h.thumbnail.path}.${h.thumbnail.extension}`
                        }
                    }
                })
                const giveResults = await Promise.allSettled(d.giveCard.map(id => marvelService.getCharacter(id)))
                giveResults.forEach(r => {
                    if (r.value) {
                        const h = r.value
                        d.giveCard[d.giveCard.findIndex(id => h.id === id)] = {
                            name: h.name,
                            id: h.id,
                            imageUrl: `${h.thumbnail.path}.${h.thumbnail.extension}`
                        }
                    }
                })
            }
            console.log(JSON.stringify(deals, null, 2))
            res.status(200).json(deals)
        }).catch(e => onErrorResponse(e, res))
    }).catch(e => onErrorResponse(e, res))
})

module.exports = router
