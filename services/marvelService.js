const {formatString} = require('../utils/ext')
const crypto = require('crypto');
const zlib = require('zlib');
const queryString = require('node:querystring');
const {response} = require("express");
const fs = require('node:fs');
const {ObjectId} = require("mongodb");

const options = {
    method: 'GET', Accept: '*/*',
}

async function getCharactersStartsWithName(name) {
    const query = buildAuthQueryParams()
    query.nameStartsWith = name
    const params = queryString.encode(query)
    console.log(`${process.env.MARVE_BASE_URL}v1/public/characters?${params}`)
    return new Promise((resolve, reject) => {
        fetch(`${process.env.MARVE_BASE_URL}v1/public/characters?${params}`)
            .then((response) => {
                console.log(response)
                if (response.status !== 200) {
                    return [];
                }
                response.json().then((r) => {
                    console.log(r)
                    resolve(r.data.results)
                })
            })
            .catch((e) => reject(e))
    })
}

async function getCharactersAmount() {
    const query = buildAuthQueryParams()
    query.limit = 1
    const params = queryString.encode(query)
    console.log(`${process.env.MARVE_BASE_URL}v1/public/characters?${params}`)
    return new Promise((resolve, reject) => {
        fetch(`${process.env.MARVE_BASE_URL}v1/public/characters?${params}`, {signal: AbortSignal.timeout(120000)})
            .then((response) => {
                console.log('response status code: ', response.status)
                if (response.status !== 200) {
                    return undefined;
                }
                response.json()
                    .then((r) => {
                        console.log(r)
                        resolve(r.data.total)
                    })
                    .catch((e) => reject(e))
            }).catch((e) => {
            console.log('finisco nel catch')
            reject(e);
        })
    })

}

async function getCharacters(page) {
    const query = buildAuthQueryParams()
    query.orderBy = 'name'
    query.limit = 40
    page = parseInt(page)
    if (page !== 1) query.offset = (page - 1) * 40
    const params = queryString.encode(query)
    console.log(`${process.env.MARVE_BASE_URL}v1/public/characters?${params}`)
    return new Promise((resolve, reject) => {
        fetch(`${process.env.MARVE_BASE_URL}v1/public/characters?${params}`, {signal: AbortSignal.timeout(120000)})
            .then((response) => {
                console.log('response status code: ', response.status)
                if (response.status !== 200) {
                    return undefined;
                }
                response.json()
                    .then((r) => {
                        r.data.total = Math.ceil(r.data.total / 40)
                        r.data.page = page
                        console.log(r)
                        resolve(r.data)
                    })
                    .catch((e) => reject(e))
            }).catch((e) => {
            console.log('finisco nel catch')
            reject(e);
        })
    })

}

async function getCharactersId(limit, offset) {
    const query = buildAuthQueryParams()
    query.orderBy = 'name'
    query.limit = limit
    query.offset = offset
    const params = queryString.encode(query)
    console.log(`${process.env.MARVE_BASE_URL}v1/public/characters?${params}`)
    return new Promise((resolve, reject) => {
        fetch(`${process.env.MARVE_BASE_URL}v1/public/characters?${params}`, {signal: AbortSignal.timeout(120000)})
            .then((response) => {
                console.log('response status code: ', response.status)
                if (response.status !== 200) {
                    return undefined;
                }
                response.json()
                    .then((r) => {
                        console.log(r)
                        resolve(r.data.results.map(d => ({
                            figurineid: d.id,
                            _id: new ObjectId()
                        })))
                    })
                    .catch((e) => reject(e))
            }).catch((e) => {
            console.log('finisco nel catch')
            reject(e);
        })
    })

}

async function getCharacter(characterId) {
    const query = buildAuthQueryParams()
    const params = queryString.encode(query)
    console.log(`${process.env.MARVE_BASE_URL}v1/public/characters/${characterId}?${params}`)
    return new Promise((resolve, reject) => {
        fetch(`${process.env.MARVE_BASE_URL}v1/public/characters/${characterId}?${params}`, {signal: AbortSignal.timeout(120000)})
            .then((response) => {
                console.log('response status code: ', response.status)
                if (response.status !== 200) {
                    return undefined;
                }
                response.json()
                    .then((r) => {
                        console.log(r)
                        const data = r.data.results[0];
                        data.description = data.description || 'No description available.';
                        data.comics.items = transformItems(data.comics.items);
                        data.series.items = transformItems(data.series.items);
                        data.stories.items = transformItems(data.stories.items);
                        data.events.items = transformItems(data.events.items);
                        resolve(data)
                    })
                    .catch((e) => reject(e))
            }).catch((e) => {
            console.log('finisco nel catch')
            reject(e);
        })
    })

}

async function getHeroDetail(path) {
    const query = buildAuthQueryParams()
    const params = queryString.encode(query)
    console.log(`${process.env.MARVE_BASE_URL}v1/public/${path}?${params}`)
    return new Promise((resolve, reject) => {
        fetch(`${process.env.MARVE_BASE_URL}v1/public/${path}?${params}`, {signal: AbortSignal.timeout(120000)})
            .then((response) => {
                response.json()
                    .then((r) => {
                        const data = r.data.results[0];
                        data.description = data.description || 'No description available.';
                        resolve(data)
                    })
                    .catch((e) => reject(e))
            }).catch((e) => {
            console.log('finisco nel catch')
            reject(e);
        })
    })

}

function transformItems(items) {
    return items.map(item => {
        item.resourceURI = item.resourceURI.replace(`${process.env.MARVE_BASE_URL}v1/public/`, "");
        const id = item.resourceURI.split('/').pop(); // Estrai l'ultimo elemento del percorso
        return {...item, id: parseInt(id)}; // Aggiungi il campo 'id' all'oggetto
    });
}

function buildAuthQueryParams() {
    const ts = Date.now()
    console.log(`timestamp ${ts}`)
    const hash = crypto.createHash('md5')
        .update(ts + process.env.MARVEL_PRIVATE + process.env.MARVEL_PUBLIC, 'utf8').digest('hex')
    console.log(`hash ${hash}`)
    console.log(`apikey ${process.env.MARVEL_PUBLIC}`)
    return {ts: ts, apikey: process.env.MARVEL_PUBLIC, hash: hash}
}


module.exports = {
    getCharacters: getCharacters,
    getCharacter: getCharacter,
    getCharactersAmount: getCharactersAmount,
    getCharactersStartsWithName: getCharactersStartsWithName,
    getHeroDetail: getHeroDetail,
    getCharactersId: getCharactersId,
}