const express = require('express')
const router = express.Router()
const {verifyToken} = require("../utils/jwtManager");
const userRepository = require('../repository/userRepository')
const marketRepository = require('../repository/marketRepository')
const marvelService = require("../services/marvelService");
const {TradeOfferModel} = require("../model/tradeOfferModel");
router.use(verifyToken)

router.get('/tradableCards', async (req, res) => {
    userRepository.findUserById(req.userId)
        .then(async u => {
            const exchangeable = await getExchangeableFigurines(u);
            res.status(200).json(exchangeable)
        }).catch(e => {
        console.log(e)
        return res.status(400).json({message: 'An error occured'});
    })
})

router.put('/createOffer', (req, res) => {
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
        }).catch(e => {
        console.log(e)
        return res.status(500).json({message: 'cannot perform request'});
    })
})

router.get('/trades', (req, res) => {
    const page = parseInt(req.query.page) || 1
    getTrades(req, res, page);
})

router.post('/acceptOffer', (req, res) => {
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
                    }).catch(e => {
                        console.log(e);
                        res.status(500).json({message: "Cannot perform request"})
                    })
                }).catch(e => {
                    console.log(e);
                    res.status(500).json({message: "Cannot perform request"})
                })
            }).catch(e => {
            console.log(e);
            res.status(500).json({message: "Cannot perform request"})
        })
    }).catch(e => {
        console.log(e);
        res.status(500).json({message: "Cannot perform request"})
    })
})

router.delete('/deleteOffer', (req, res) => {
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
                        .catch(_ => res.status(500).json({message: 'Cannot perform request'}))
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
        .then(async offersResults => {
            const userOffers = offersResults[0].value
            const othersOffers = offersResults[1].value
            const totalOffers = offersResults[2].value
            const currentUser = offersResults[3].value
            if (!userOffers || !othersOffers || !totalOffers || !currentUser) {
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