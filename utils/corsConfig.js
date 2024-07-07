const cors = require('cors')
const corsOption = {origin: true, credentials: true}

module.exports = {
    corsSetup: cors(corsOption)
}