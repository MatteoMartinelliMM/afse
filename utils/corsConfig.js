const cors = require('cors')
const corsOption = {origin: true}

module.exports = {
    corsSetup: cors(corsOption)
}