const express = require('express')
const router = express.Router()
const {verifyToken} = require("../utils/jwtManager");
const marvelService = require('../services/marvelService')
const authRepository = require("../repository/userRepository");
const figurineRepository = require("../repository/figurineRepository")
const userRepository = require("../repository/userRepository")
const Figurine = require("../model/figurine");
const {onErrorResponse} = require("../utils/ext");


router.get('/characters/:name', (req, res) => {
    /**
     #swagger.tags = ['Marvel Service']
     #swagger.summary = 'Recupera i personaggi Marvel che iniziano con un determinato nome'
     #swagger.description = 'Recupera i personaggi Marvel il cui nome inizia con il valore specificato nel parametro "name". Richiede un JWT token per autenticare la richiesta.'
     #swagger.parameters['name'] = {
     in: 'path',
     description: 'Nome o parte iniziale del nome del personaggio da cercare',
     required: true,
     type: 'string',
     example: 'Spider'
     }
     #swagger.responses[200] = {
     description: 'Lista di personaggi recuperata con successo',
     schema: {
     type: 'array',
     items: {
     type: 'object',
     properties: {
     characterId: {
     type: 'string',
     description: 'ID del personaggio',
     example: '1009610'
     },
     name: {
     type: 'string',
     description: 'Nome del personaggio',
     example: 'Spider-Man'
     },
     description: {
     type: 'string',
     description: 'Breve descrizione del personaggio',
     example: 'Bitten by a radioactive spider, Peter Parker now has spider-like abilities.'
     },
     imageUrl: {
     type: 'string',
     description: 'URL dell\'immagine del personaggio',
     example: 'http://example.com/spider-man.jpg'
     }
     }
     }
     }
     }

     #swagger.responses[404] = {
     description: 'Nessun personaggio trovato con il nome specificato',
     schema: {
     type: 'object',
     properties: {
     message: {
     type: 'string',
     description: 'Messaggio di errore',
     example: 'Nessun personaggio trovato'
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
    const name = req.params.name
    marvelService.getCharactersStartsWithName(name)
        .then((characters) => res.status(200).json(characters))
        .catch(e => onErrorResponse(e, res))
})

router.use(verifyToken)

router.get('/characters', (req, res) => {
    /**
     #swagger.tags = ['Marvel Service']
     #swagger.summary = 'Recupera i personaggi Marvel con paginazione'
     #swagger.description = 'Recupera una lista di personaggi Marvel, suddivisi per pagina. Richiede un JWT token per autenticare la richiesta.'
     #swagger.security = [{ "cookieAuth": [] }]

     #swagger.parameters['page'] = {
     in: 'query',
     description: 'Numero della pagina da recuperare',
     required: false,
     type: 'integer',
     default: 1,
     example: 2
     }

     #swagger.responses[200] = {
     description: 'Lista di personaggi recuperata con successo, inclusi i dettagli delle figurine',
     schema: {
     type: 'object',
     properties: {
     page: {
     type: 'integer',
     description: 'Numero della pagina corrente',
     example: 2
     },
     totalPages: {
     type: 'integer',
     description: 'Numero totale di pagine',
     example: 5
     },
     characters: {
     type: 'array',
     items: {
     type: 'object',
     properties: {
     characterId: {
     type: 'string',
     description: 'ID del personaggio',
     example: '1009610'
     },
     name: {
     type: 'string',
     description: 'Nome del personaggio',
     example: 'Spider-Man'
     },
     description: {
     type: 'string',
     description: 'Breve descrizione del personaggio',
     example: 'Bitten by a radioactive spider, Peter Parker now has spider-like abilities.'
     },
     imageUrl: {
     type: 'string',
     description: 'URL dell\'immagine del personaggio',
     example: 'http://example.com/spider-man.jpg'
     },
     hasFigurine: {
     type: 'boolean',
     description: 'Indica se l\'utente possiede la figurina di questo personaggio',
     example: true
     }
     }
     },
     description: 'Lista dei personaggi nella pagina corrente'
     },
     total: {
     type: 'integer',
     description: 'Numero totale di personaggi trovati',
     example: 50
     }
     }
     }
     }

     #swagger.responses[400] = {
     description: 'Errore nella richiesta (Marvel non risponde)',
     schema: {
     type: 'object',
     properties: {
     message: {
     type: 'string',
     description: 'Messaggio di errore',
     example: 'Marvel does not respond'
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
    const page = req.query.page || 1
    marvelService.getCharacters(page).then(async (data) => {
        if (data) {
            console.log('mando risposta json')
            data = await figurineRepository.addFigurineDetails(data, req.userId)
            res.status(200).json(data)
            return
        }
        res.status(400).json({message: 'Marvel does not respond'})
    }).catch((e) => console.error(e))
})

router.get('/character', async (req, res) => {
    /**
     #swagger.tags = ['Marvel Service']
     #swagger.summary = 'Recupera i dettagli di un personaggio Marvel'
     #swagger.description = 'Recupera le informazioni di un personaggio Marvel specifico utilizzando il suo ID. Richiede un JWT token per autenticare la richiesta.'
     #swagger.security = [{ "cookieAuth": [] }]

     #swagger.parameters['id'] = {
     in: 'query',
     description: 'ID del personaggio Marvel da recuperare',
     required: true,
     type: 'integer',
     example: 1011334
     }

     #swagger.responses[200] = {
     description: 'Dettagli del personaggio recuperati con successo',
     schema: {
     type: 'object',
     properties: {
     id: {
     type: 'integer',
     description: 'ID del personaggio',
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
     description: 'Data dell\'ultima modifica',
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
     resourceURI: {
     type: 'string',
     description: 'URI della risorsa del personaggio',
     example: 'http://gateway.marvel.com/v1/public/characters/1011334'
     },
     comics: {
     type: 'object',
     properties: {
     available: {
     type: 'integer',
     description: 'Numero totale di fumetti',
     example: 12
     },
     collectionURI: {
     type: 'string',
     description: 'URI della collezione di fumetti',
     example: 'http://gateway.marvel.com/v1/public/characters/1011334/comics'
     },
     items: {
     type: 'array',
     items: {
     type: 'object',
     properties: {
     resourceURI: {
     type: 'string',
     description: 'URI del fumetto',
     example: 'http://gateway.marvel.com/v1/public/comics/21366'
     },
     name: {
     type: 'string',
     description: 'Nome del fumetto',
     example: 'Avengers: The Initiative (2007) #14'
     }
     }
     }
     },
     returned: {
     type: 'integer',
     description: 'Numero di fumetti restituiti',
     example: 12
     }
     }
     },
     series: {
     type: 'object',
     properties: {
     available: {
     type: 'integer',
     description: 'Numero totale di serie',
     example: 3
     },
     collectionURI: {
     type: 'string',
     description: 'URI della collezione di serie',
     example: 'http://gateway.marvel.com/v1/public/characters/1011334/series'
     },
     items: {
     type: 'array',
     items: {
     type: 'object',
     properties: {
     resourceURI: {
     type: 'string',
     description: 'URI della serie',
     example: 'http://gateway.marvel.com/v1/public/series/1945'
     },
     name: {
     type: 'string',
     description: 'Nome della serie',
     example: 'Avengers: The Initiative (2007 - 2010)'
     }
     }
     }
     },
     returned: {
     type: 'integer',
     description: 'Numero di serie restituite',
     example: 3
     }
     }
     },
     stories: {
     type: 'object',
     properties: {
     available: {
     type: 'integer',
     description: 'Numero totale di storie',
     example: 21
     },
     collectionURI: {
     type: 'string',
     description: 'URI della collezione di storie',
     example: 'http://gateway.marvel.com/v1/public/characters/1011334/stories'
     },
     items: {
     type: 'array',
     items: {
     type: 'object',
     properties: {
     resourceURI: {
     type: 'string',
     description: 'URI della storia',
     example: 'http://gateway.marvel.com/v1/public/stories/19947'
     },
     name: {
     type: 'string',
     description: 'Nome della storia',
     example: 'Cover #19947'
     },
     type: {
     type: 'string',
     description: 'Tipo di storia',
     example: 'cover'
     }
     }
     }
     },
     returned: {
     type: 'integer',
     description: 'Numero di storie restituite',
     example: 20
     }
     }
     },
     events: {
     type: 'object',
     properties: {
     available: {
     type: 'integer',
     description: 'Numero totale di eventi',
     example: 1
     },
     collectionURI: {
     type: 'string',
     description: 'URI della collezione di eventi',
     example: 'http://gateway.marvel.com/v1/public/characters/1011334/events'
     },
     items: {
     type: 'array',
     items: {
     type: 'object',
     properties: {
     resourceURI: {
     type: 'string',
     description: 'URI dell\'evento',
     example: 'http://gateway.marvel.com/v1/public/events/269'
     },
     name: {
     type: 'string',
     description: 'Nome dell\'evento',
     example: 'Secret Invasion'
     }
     }
     }
     },
     returned: {
     type: 'integer',
     description: 'Numero di eventi restituiti',
     example: 1
     }
     }
     },
     urls: {
     type: 'array',
     items: {
     type: 'object',
     properties: {
     type: {
     type: 'string',
     description: 'Tipo di URL',
     example: 'detail'
     },
     url: {
     type: 'string',
     description: 'URL di dettaglio',
     example: 'http://marvel.com/characters/74/3-d_man?utm_campaign=apiRef&utm_source=422c32a7c4c3f9adfe3f4aef0db1a1e8'
     }
     }
     }
     }
     }
     }
     }

     #swagger.responses[400] = {
     description: 'ID del personaggio mancante',
     schema: {
     type: 'object',
     properties: {
     message: {
     type: 'string',
     description: 'Messaggio di errore',
     example: 'missing character id'
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
    const id = req.query.id
    if (!id) {
        res.send(400).json({message: 'missing character id'})
        return;
    }
    const figurineId = parseInt(id)

    const apiRes = await marvelService.getCharacter(id)
    console.log(JSON.stringify(apiRes, null, 2))
    console.log('mando risposta json')
    res.status(200).json(apiRes)
})

router.get('/heroDetail', async (req, res) => {
    /**
     #swagger.tags = ['Marvel Service']
     #swagger.summary = 'Recupera i dettagli di una risorsa Marvel specifica'
     #swagger.description = 'Recupera informazioni dettagliate su una risorsa Marvel, utilizzando un percorso relativo fornito come parametro query. Richiede un JWT token per autenticare la richiesta.'
     #swagger.security = [{ "cookieAuth": [] }]

     #swagger.parameters['path'] = {
     in: 'query',
     description: 'Percorso relativo del dettaglio del supereroe da scaricare',
     required: true,
     type: 'integer',
     example: 1011334
     }

     #swagger.responses[200] = {
     description: 'Dettagli della risorsa recuperati con successo',
     schema: {
     type: 'object',
     properties: {
     id: {
     type: 'integer',
     description: 'ID della risorsa',
     example: 1170
     },
     title: {
     type: 'string',
     description: 'Titolo della risorsa (fumetto, serie, evento, ecc.)',
     example: 'Avengers #1170'
     },
     description: {
     type: 'string',
     description: 'Descrizione della risorsa',
     example: 'A great battle between the Avengers and the X-Men.'
     },
     thumbnail: {
     type: 'object',
     properties: {
     path: {
     type: 'string',
     description: 'Percorso dell\'immagine della risorsa',
     example: 'http://i.annihil.us/u/prod/marvel/i/mg/5/c0/535febf3b9784'
     },
     extension: {
     type: 'string',
     description: 'Estensione dell\'immagine',
     example: 'jpg'
     }
     }
     },
     resourceURI: {
     type: 'string',
     description: 'URI della risorsa',
     example: 'http://gateway.marvel.com/v1/public/comics/1170'
     }
     }
     }
     }

     #swagger.responses[400] = {
     description: 'Errore nella richiesta: percorso mancante o Marvel non risponde',
     schema: {
     type: 'object',
     properties: {
     message: {
     type: 'string',
     description: 'Messaggio di errore',
     example: 'missing character id'
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
    const path = req.query.path
    if (!path) {
        res.send(400).json({message: 'missing character id'})
        return;
    }

    marvelService.getHeroDetail(path).then(data => {
        if (!data) {
            res.status(400).json({message: 'Marvel does not respond'})
            return;
        }
        res.status(200).json(data)
    }).catch(e => res.status(400).json({message: 'Marvel does not respond'}))
})

router.get('/charactersTrade/:name', (req, res) => {
 /**
  #swagger.tags = ['Marvel Service']
  #swagger.summary = 'Ricerca personaggi da scambiare per nome'
  #swagger.description = 'Recupera i personaggi Marvel che iniziano con un certo nome, filtrando quelli già posseduti o scambiabili dall\'utente. Richiede un JWT token per autenticare la richiesta.'

  #swagger.security = [{ "cookieAuth": [] }]

  #swagger.parameters['name'] = {
  in: 'path',
  description: 'Nome o parte del nome del personaggio da cercare',
  required: true,
  type: 'string',
  example: 'Spider'
  }

  #swagger.responses[200] = {
  description: 'Personaggi recuperati con successo e filtrati',
  schema: {
  type: 'array',
  items: {
  type: 'object',
  properties: {
  id: {
  type: 'integer',
  description: 'ID del personaggio',
  example: 1011334
  },
  name: {
  type: 'string',
  description: 'Nome del personaggio',
  example: 'Spider-Man'
  },
  description: {
  type: 'string',
  description: 'Breve descrizione del personaggio',
  example: 'Peter Parker was bitten by a radioactive spider and gained superpowers.'
  },
  thumbnail: {
  type: 'object',
  properties: {
  path: {
  type: 'string',
  description: 'Percorso dell\'immagine del personaggio',
  example: 'http://i.annihil.us/u/prod/marvel/i/mg/5/c0/535febf3b9784'
  },
  extension: {
  type: 'string',
  description: 'Estensione dell\'immagine',
  example: 'jpg'
  }
  }
  },
  resourceURI: {
  type: 'string',
  description: 'URI della risorsa del personaggio',
  example: 'http://gateway.marvel.com/v1/public/characters/1011334'
  }
  }
  }
  }
  }

  #swagger.responses[400] = {
  description: 'Errore nella richiesta o dati mancanti',
  schema: {
  type: 'object',
  properties: {
  message: {
  type: 'string',
  description: 'Messaggio di errore',
  example: 'Error fetching data'
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
    const name = req.params.name
    Promise.allSettled([marvelService.getCharactersStartsWithName(name), userRepository.findUserById(req.userId)])
        .then(result => {
            const characters = result[0].value
            const user = result[1].value
            if (characters && user) {
                const userCards = [...user.figurine.map(f => f.figurineId),
                    ...user.exchangeable.map(f => f.figurineId)]
                res.status(200).json(characters.filter(c => !userCards.includes(c.id)))
                return;
            }
            res.status(200).json({message: 'Error fetching data'})
        })

})

module.exports = router
