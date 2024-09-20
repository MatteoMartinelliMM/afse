const express = require('express')
const router = express.Router()
const {verifyToken} = require("../utils/jwtManager");
const userRepository = require('../repository/userRepository')
const marketRepository = require('../repository/marketRepository')
const marvelService = require("../services/marvelService");
const {TradeOfferModel} = require("../model/tradeOfferModel");
const {onErrorResponse} = require("../utils/ext");
router.use(verifyToken)

router.get('/tradableCards', async (req, res) => {
    /**
     #swagger.tags = ['Marketplace']
     #swagger.summary = 'Recupera figurine scambiabili di un utente'
     #swagger.description = 'Recupera la lista di figurine scambiabili di un utente autenticato. Richiede un JWT token per autenticare la richiesta.'
     #swagger.security = [{ "cookieAuth": [] }]

     #swagger.responses[200] = {
     description: 'Lista delle figurine scambiabili recuperata con successo',
     schema: {
     type: 'array',
     items: {
     type: 'object',
     properties: {
     id: {
     type: 'integer',
     description: 'ID della figurina (corrisponde a un personaggio Marvel)',
     example: 1011334
     },
     name: {
     type: 'string',
     description: 'Nome del personaggio',
     example: '3-D Man'
     },
     description: {
     type: 'string',
     description: 'Descrizione del personaggio',
     example: ''
     },
     modified: {
     type: 'string',
     description: 'Data dell\'ultima modifica del personaggio',
     example: '2014-04-29T14:18:17-0400'
     },
     thumbnail: {
     type: 'object',
     properties: {
     path: {
     type: 'string',
     description: 'Percorso dell\'immagine del personaggio',
     example: 'http://i.annihil.us/u/prod/marvel/i/mg/c/e0/535fecbbb9784'
     },
     extension: {
     type: 'string',
     description: 'Estensione dell\'immagine',
     example: 'jpg'
     }
     }
     },
     quantity: {
     type: 'integer',
     description: 'Numero di figurine scambiabili',
     example: 2
     }
     }
     }
     }
     }

     #swagger.responses[400] = {
     description: 'Errore nella richiesta, dati mancanti o non validi',
     schema: {
     type: 'object',
     properties: {
     message: {
     type: 'string',
     description: 'Messaggio di errore',
     example: 'Dati utente mancanti o non validi'
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
    userRepository.findUserById(req.userId)
        .then(async u => {
            const exchangeable = await getExchangeableFigurines(u);
            res.status(200).json(exchangeable);
        })
        .catch(e => onErrorResponse(e, res));
});

router.post('/createOffer', (req, res) => {
    /**
     #swagger.tags = ['Marketplace']
     #swagger.summary = 'Crea una nuova offerta di scambio'
     #swagger.description = 'Consente a un utente autenticato di creare un\'offerta di scambio inserendo le figurine che desidera scambiare e quelle che vorrebbe ricevere. Richiede un JWT token per autenticare la richiesta.'
     #swagger.security = [{ "cookieAuth": [] }]

     #swagger.parameters['body'] = {
     in: 'body',
     description: 'Dati per la creazione dell\'offerta di scambio',
     required: true,
     schema: {
     type: 'object',
     properties: {
     giveCards: {
     type: 'array',
     items: {
     type: 'integer',
     description: 'ID della figurina da offrire'
     },
     description: 'Lista delle figurine che l\'utente intende scambiare',
     example: [1011334, 1017100]
     },
     recieveCards: {
     type: 'array',
     items: {
     type: 'integer',
     description: 'ID della figurina desiderata'
     },
     description: 'Lista delle figurine che l\'utente desidera ricevere',
     example: [1011335, 1017101]
     }
     },
     required: ['giveCards', 'recieveCards']
     }
     }

     #swagger.responses[200] = {
     description: 'Offerta di scambio creata con successo',
     schema: {
     type: 'array',
     items: {
     type: 'object',
     properties: {
     id: {
     type: 'integer',
     description: 'ID della figurina (corrisponde a un personaggio Marvel)',
     example: 1011334
     },
     name: {
     type: 'string',
     description: 'Nome del personaggio',
     example: '3-D Man'
     },
     description: {
     type: 'string',
     description: 'Descrizione del personaggio',
     example: ''
     },
     modified: {
     type: 'string',
     description: 'Data dell\'ultima modifica del personaggio',
     example: '2014-04-29T14:18:17-0400'
     },
     thumbnail: {
     type: 'object',
     properties: {
     path: {
     type: 'string',
     description: 'Percorso dell\'immagine del personaggio',
     example: 'http://i.annihil.us/u/prod/marvel/i/mg/c/e0/535fecbbb9784'
     },
     extension: {
     type: 'string',
     description: 'Estensione dell\'immagine',
     example: 'jpg'
     }
     }
     },
     quantity: {
     type: 'integer',
     description: 'Numero di figurine scambiabili rimaste',
     example: 2
     }
     }
     }
     }
     }

     #swagger.responses[400] = {
     description: 'Errore nella richiesta: non è possibile effettuare uno scambio senza carte',
     schema: {
     type: 'object',
     properties: {
     message: {
     type: 'string',
     description: 'Messaggio di errore',
     example: 'Cannot make trade without cards'
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
    userRepository.findUserById(req.userId)
        .then(async u => {
            console.log('ciao')
            if (req.body.giveCards.length === 0 || req.body.recieveCards.length === 0) {
                res.status(400).json({message: 'Cannot make trade without cards'})
                return;
            }
            u.inTrade = u.inTrade || []
            const inTrade = u.inTrade
            const newExchangeable = [...u.exchangeable];
            req.body.giveCards.forEach(id => {
                const index = newExchangeable.findIndex(item => item.figurineId === id);
                if (index !== -1) {
                    inTrade.push(newExchangeable[index]);
                    newExchangeable.splice(index, 1);
                }
            })
            await userRepository.updateUser(u,
                {
                    "inTrade": inTrade,
                    "exchangeable": newExchangeable
                }
            )
            await marketRepository.createMarketOffer(new TradeOfferModel(req.userId, req.body.giveCards, req.body.recieveCards))
            u.inTrade = inTrade
            u.exchangeable = newExchangeable
            res.status(200).json(await getExchangeableFigurines(u))
        }).catch(e => onErrorResponse(e, res))
})

router.get('/trades', (req, res) => {
    /**
     #swagger.tags = ['Marketplace']
     #swagger.summary = 'Recupera le offerte di scambio dell\'utente e degli altri utenti'
     #swagger.description = 'Recupera tutte le offerte di scambio attive dell\'utente corrente e degli altri utenti. Restituisce anche informazioni paginabili sul totale delle offerte disponibili. Richiede un JWT token per autenticare la richiesta.'
     #swagger.security = [{ "cookieAuth": [] }]

     #swagger.parameters['page'] = {
     in: 'query',
     description: 'Numero di pagina per la paginazione delle offerte',
     required: false,
     type: 'integer',
     example: 1
     }

     #swagger.responses[200] = {
     description: 'Offerte di scambio recuperate con successo',
     schema: {
     type: 'object',
     properties: {
     currentPage: {
     type: 'integer',
     description: 'Numero della pagina corrente',
     example: 1
     },
     totalPages: {
     type: 'integer',
     description: 'Numero totale di pagine basato sul totale delle offerte',
     example: 5
     },
     totalOffers: {
     type: 'integer',
     description: 'Numero totale di offerte disponibili',
     example: 50
     },
     userOffers: {
     type: 'array',
     items: {
     type: 'object',
     properties: {
     offerId: {
     type: 'integer',
     description: 'ID dell\'offerta',
     example: 12345
     },
     giveCards: {
     type: 'array',
     items: {
     type: 'integer',
     description: 'ID delle figurine offerte'
     },
     description: 'Figurine che l\'utente sta offrendo',
     example: [1011334, 1017100]
     },
     recieveCards: {
     type: 'array',
     items: {
     type: 'integer',
     description: 'ID delle figurine richieste'
     },
     description: 'Figurine che l\'utente desidera ricevere',
     example: [1011335, 1017101]
     }
     }
     }
     },
     othersOffers: {
     type: 'array',
     items: {
     type: 'object',
     properties: {
     offerId: {
     type: 'integer',
     description: 'ID dell\'offerta',
     example: 54321
     },
     bidder: {
     type: 'integer',
     description: 'ID dell\'utente che ha fatto l\'offerta',
     example: 78910
     },
     giveCards: {
     type: 'array',
     items: {
     type: 'integer',
     description: 'ID delle figurine offerte'
     },
     description: 'Figurine che l\'utente sta offrendo',
     example: [1011336, 1017102]
     },
     recieveCards: {
     type: 'array',
     items: {
     type: 'integer',
     description: 'ID delle figurine richieste'
     },
     description: 'Figurine che l\'utente desidera ricevere',
     example: [1011337, 1017103]
     }
     }
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
     example: 'Cannot perform request'
     }
     }
     }
     }
     */
    const page = parseInt(req.query.page) || 1
    getTrades(req, res, page);
})

router.post('/acceptOffer', (req, res) => {
    /**
     #swagger.tags = ['Marketplace']
     #swagger.summary = 'Accetta un\'offerta di scambio'
     #swagger.description = 'Permette a un utente di accettare un\'offerta di scambio. Richiede un JWT token per autenticare la richiesta. L\'offerta accettata deve essere valida e i due utenti devono esistere.'
     #swagger.security = [{ "cookieAuth": [] }]

     #swagger.parameters['body'] = {
     in: 'body',
     description: 'Dati per accettare un\'offerta di scambio',
     required: true,
     schema: {
     type: 'object',
     properties: {
     offerId: {
     type: 'integer',
     description: 'ID dell\'offerta da accettare',
     example: 12345
     },
     currentPage: {
     type: 'integer',
     description: 'Numero della pagina corrente per la paginazione delle offerte',
     example: 1
     }
     },
     required: ['offerId', 'currentPage']
     }
     }

     #swagger.responses[200] = {
     description: 'Offerta di scambio accettata con successo',
     schema: {
     type: 'object',
     properties: {
     message: {
     type: 'string',
     description: 'Messaggio di successo',
     example: 'Trade accepted successfully'
     },
     trades: {
     type: 'array',
     items: {
     type: 'object',
     properties: {
     offerId: {
     type: 'integer',
     description: 'ID dell\'offerta',
     example: 12345
     },
     giveCards: {
     type: 'array',
     items: {
     type: 'integer',
     description: 'ID delle figurine offerte'
     },
     description: 'Figurine che l\'utente sta offrendo',
     example: [1011334, 1017100]
     },
     recieveCards: {
     type: 'array',
     items: {
     type: 'integer',
     description: 'ID delle figurine richieste'
     },
     description: 'Figurine che l\'utente desidera ricevere',
     example: [1011335, 1017101]
     }
     }
     }
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
     example: 'Cannot perform request'
     }
     }
     }
     }
     */
    marketRepository.getOfferById(req.body.offerId).then(offer => {
        userRepository.findUserByIds([req.userId, offer.bidder], true)
            .then(async users => {
                const currentUser = users[0]
                const bidderUser = users[1]
                if (!currentUser || !bidderUser || !offer) {
                    res.status(500).json({message: "Cannot perform request"})
                    return
                }
                processTrade(currentUser, bidderUser, offer).then(_ => {
                    cleanUpInvalidTrades(currentUser, bidderUser).then(_ => {
                        getTrades(req, res, req.body.currentPage)
                    }).catch(e => onErrorResponse(e, res))
                }).catch(e => onErrorResponse(e, res))
            }).catch(e => onErrorResponse(e, res))
    }).catch(e => onErrorResponse(e, res))
})

router.delete('/deleteOffer', (req, res) => {
    /**
     #swagger.tags = ['Marketplace']
     #swagger.summary = 'Elimina un\'offerta di scambio'
     #swagger.description = 'Consente a un utente di eliminare un\'offerta di scambio esistente. Richiede un JWT token per autenticare la richiesta. L\'ID dell\'offerta da eliminare deve essere fornito nel corpo della richiesta.'
     #swagger.security = [{ "cookieAuth": [] }]

     #swagger.parameters['body'] = {
     in: 'body',
     description: 'Dati per eliminare un\'offerta di scambio',
     required: true,
     schema: {
     type: 'object',
     properties: {
     offerId: {
     type: 'integer',
     description: 'ID dell\'offerta da eliminare',
     example: 12345
     }
     },
     required: ['offerId']
     }
     }

     #swagger.responses[200] = {
     description: 'Offerta di scambio eliminata con successo',
     schema: {
     type: 'object',
     properties: {
     message: {
     type: 'string',
     description: 'Messaggio di successo',
     example: 'Offer deleted successfully'
     }
     }
     }
     }

     #swagger.responses[400] = {
     description: 'Errore nella richiesta: ID mancante',
     schema: {
     type: 'object',
     properties: {
     message: {
     type: 'string',
     description: 'Messaggio di errore',
     example: 'Cannot delete without an id'
     }
     }
     }
     }

     #swagger.responses[500] = {
     description: 'Errore interno del server o offerta non valida',
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

    if (!req.body.offerId) {
        res.status(400).json({message: 'Cannot delete without an id'})
        return;
    }
    Promise.allSettled([userRepository.findUserById(req.userId), marketRepository.getOfferById(req.body.offerId)])
        .then(results => {
            const user = results[0].value
            const offer = results[1].value
            if (!offer || !user) {
                res.status(500).json({message: 'Cannot perform request'})
                return;
            }
            marketRepository.deleteTradeOfferById(req.body.offerId).then(result => {
                if (result) {
                    offer.giveCard.forEach(id => {
                        user.exchangeable.push(removeCardById(id, user.inTrade))
                    })
                    userRepository.updateUser(user, {
                        exchangeable: user.exchangeable,
                        inTrade: user.inTrade
                    }).then(_ => res.status(200).json({message: 'Offer deleted successfully'}))
                        .catch(e => onErrorResponse(e, res))
                    return;
                }
                res.status(500).json({message: 'Cannot perform request'})
            })
        })
})

function getTrades(req, res, page) {
    Promise.allSettled([marketRepository.findInTradeOffersForUser(req.userId),
        marketRepository.getMarketOffersByOthersUser(req.userId),
        marketRepository.getTotalMarketOffersByOthersUser(req.userId),
        userRepository.findUserById(req.userId)])
        .then(async results => {
            const userOffers = results[0].value
            const othersOffers = results[1].value
            const totalOffers = results[2].value
            const currentUser = results[3].value
            if (results.some(result => result.status === 'rejected')) {
                res.status(500).json({message: 'Cannot perform request'})
                return
            }
            const users = await userRepository.findUserByIds([...new Set(othersOffers.map(o => o.bidder))])
            const processOffersResults = await Promise.allSettled([
                processUserOffers(userOffers), // Prima lista di offerte
                processOffers(othersOffers, currentUser, users) // Seconda lista con utenti inclusi
            ]);
            if (processOffersResults.every(result => result.status === 'fulfilled')) {
                console.log(JSON.stringify({
                        currentPage: page,
                        totalPages: Math.ceil(totalOffers / 10),
                        totalOffers: totalOffers,
                        userOffers: userOffers,
                        othersOffers: othersOffers
                    },
                    null, 2
                ))
                res.status(200).json({
                    currentPage: page,
                    totalPages: Math.ceil(totalOffers / 10),
                    totalOffers: totalOffers,
                    userOffers: userOffers,
                    othersOffers: othersOffers
                })
                return;
            }
            res.status(500).json({message: "Cannot perform request"})
        })
}

async function processTrade(currentUser, bidderUser, offer) {
    const {giveCard, receiveCard} = offer;

    // Helper function to remove an object from a list by id and return it


    // Step 1: Prendi le carte da bidderUser (da inTrade) e mettile in figurine di currentUser
    giveCard.forEach(cardId => {
        const card = removeCardById(cardId, bidderUser.inTrade);
        if (card) {
            currentUser.figurine.push(card);
        }
    });

    // Step 2: Cerca e rimuovi le carte che currentUser deve dare a bidderUser
    receiveCard.forEach(cardId => {
        let card;

        // Cerca in exchangeable
        card = removeCardById(cardId, currentUser.exchangeable);
        if (card) {
            bidderUser.figurine.push(card);
            return; // Carta trovata, passa alla prossima iterazione
        }

        // Cerca in inTrade
        card = removeCardById(cardId, currentUser.inTrade);
        if (card) {
            bidderUser.figurine.push(card);
            return; // Carta trovata, passa alla prossima iterazione
        }

        // Cerca in figurine
        card = removeCardById(cardId, currentUser.figurine);
        if (card) {
            bidderUser.figurine.push(card);
        }
    });

    // Step 3: Aggiorna i due utenti nel database
    await userRepository.updateUser(currentUser, {
        figurine: currentUser.figurine,
        exchangeable: currentUser.exchangeable,
        inTrade: currentUser.inTrade
    });

    await userRepository.updateUser(bidderUser, {
        figurine: bidderUser.figurine,
        inTrade: bidderUser.inTrade
    });

    await marketRepository.updateTradeStatus(offer._id.toString(), {
        receiver: currentUser._id.toString(),
        dealDate: new Date(),
        status: 'completed'
    })
}

async function processUserOffers(offers) {
    await Promise.allSettled(offers.map(async o => {
        const receiveCardsRes = await Promise.allSettled(o.receiveCard.map(id => marvelService.getCharacter(id)));
        receiveCardsRes.forEach(r => {
            if (r.value) {
                const card = r.value;
                const index = o.receiveCard.findIndex(id => card.id === id);  // Trova l'indice dell'ID
                if (index !== -1) {
                    o.receiveCard[index] = {
                        id: card.id,
                        name: card.name,
                        thumbnail: card.thumbnail
                    };
                }
            }
        });

        const giveCardsRes = await Promise.allSettled(o.giveCard.map(id => marvelService.getCharacter(id)));
        giveCardsRes.forEach(r => {
            if (r.value) {
                const card = r.value;
                const index = o.giveCard.findIndex(id => card.id === id);  // Trova l'indice dell'ID
                if (index !== -1) {
                    o.giveCard[index] = {
                        id: card.id,
                        name: card.name,
                        thumbnail: card.thumbnail
                    };
                }
            }
        });
    }))
}

async function cleanUpInvalidTrades(currentUser, bidderUser) {
    const users = [currentUser, bidderUser];

    // Helper function to move cards from inTrade to exchangeable
    function moveCardsToExchangeable(user, inTradeCards) {
        inTradeCards.forEach(cardId => {
            const index = user.inTrade.findIndex(card => card.id === cardId);
            if (index !== -1) {
                const [card] = user.inTrade.splice(index, 1);  // Remove from inTrade
                user.exchangeable.push(card);                  // Add to exchangeable
            }
        });
    }

    // For each user, check their trades and clean up invalid trades
    for (const user of users) {
        // Ottieni tutte le trade offer con status inTrade
        const tradeOffers = await marketRepository.findInTradeOffersForUser(user._id.toString());

        for (const offer of tradeOffers) {
            // Controlla se una delle receiveCard è già in figurine di uno degli utenti
            const receiveCards = offer.receiveCard; // Lista di id delle carte che l'utente deve ricevere
            const invalidTrade = receiveCards.some(cardId => user.figurine.some(card => card.figurineId === cardId));

            if (invalidTrade) {
                // Trade offer non valida: rimuovila
                await marketRepository.deleteTradeOfferById(offer._id);

                // Sposta le carte da inTrade a exchangeable
                moveCardsToExchangeable(user, offer.giveCard);
            }
        }

        // Aggiorna lo stato dell'utente nel database
        await userRepository.updateUser(user._id, {
            exchangeable: user.exchangeable,
            inTrade: user.inTrade
        });
    }
}

async function processOffers(offers, currentUser, users) {
    await Promise.allSettled(offers.map(async o => {
        const u = users.find(u => u._id.toString() === o.bidder)
        o.bidderProfilePicture = u?.profilePicture || '';
        o.bidderUsername = u?.username || 'Unknown';


        const receiveCardsRes = await Promise.allSettled(o.receiveCard.map(id => marvelService.getCharacter(id)));
        receiveCardsRes.forEach(r => {
            if (r.value) {
                const card = r.value;
                const index = o.receiveCard.findIndex(id => card.id === id);  // Trova l'indice dell'ID
                if (index !== -1) {
                    o.receiveCard[index] = {
                        id: card.id,
                        name: card.name,
                        thumbnail: card.thumbnail,
                        owned: !!currentUser.figurine.find(f => f.figurineId === card.id),
                    };
                }
            }
        });

        const giveCardsRes = await Promise.allSettled(o.giveCard.map(id => marvelService.getCharacter(id)));
        giveCardsRes.forEach(r => {
            if (r.value) {
                const card = r.value;
                const index = o.giveCard.findIndex(id => card.id === id);  // Trova l'indice dell'ID
                if (index !== -1) {
                    o.giveCard[index] = {
                        id: card.id,
                        name: card.name,
                        thumbnail: card.thumbnail,
                        owned: !!currentUser.figurine.find(f => f.figurineId === card.id)
                    };
                }
            }
        });
    }));
}

function removeCardById(cardId, list) {
    const index = list.findIndex(card => card.figurineId === cardId);
    if (index !== -1) {
        // Rimuovi e restituisci l'oggetto
        return list.splice(index, 1)[0];
    }
    return null;
}

async function getExchangeableFigurines(u) {
    const exchangeableIds = [...new Set(u.exchangeable?.map(f => f.figurineId) || [])];
    const idCountMap = u.exchangeable.reduce((acc, item) => {
        acc[item.figurineId] = (acc[item.figurineId] || 0) + 1;
        return acc;
    }, {});
    const exchangeable = []
    for (const id of exchangeableIds) {
        const h = await marvelService.getCharacter(id)
        h.quantity = idCountMap[id]
        exchangeable.push(h)
    }
    return exchangeable;
}

module.exports = router