const {formatString} = require('../utils/ext')
const crypto = require('crypto');
const zlib = require('zlib');
const queryString = require('node:querystring');
const {response} = require("express");

const options = {
    method: 'GET', Accept: '*/*',
}

async function getCharactersStartsWithName(name) {
    const query = buildAuthQueryParams()
    query.nameStartsWith = name
    const params = queryString.encode(query)
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

async function getCharacters() {
    const query = buildAuthQueryParams()
    console.log(`marvel call: ${process.env.MARVE_BASE_URL}v1/public/characters?${query}`)
    const params = queryString.encode(query)
    return new Promise((resolve, reject) => {
        fetch(`${process.env.MARVE_BASE_URL}v1/public/characters${params}`)
            .then((response) => {
                if (response.status !== 200) {
                    return [];
                }
                response.json()
                    .then((r) => {
                        console.log(r)
                        resolve(r.data.results)
                    })
                    .catch((e) => reject(e))
            }).catch((e) => reject(e))
    })

}

function buildAuthQueryParams() {
    const ts = Date.now()
    console.log(`timestamp ${ts}`)
    const hash = crypto.createHash('md5')
        .update(ts + process.env.MARVEL_PRIVATE + process.env.MARVEL_PUBLIC, 'utf8').digest('hex')
    console.log(`hash ${hash}`)
    return {ts: ts, apikey: process.env.MARVEL_PUBLIC, hash: hash}
}


module.exports = {
    getCharacters: getCharacters, getCharactersStartsWithName: getCharactersStartsWithName,
}