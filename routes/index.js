const authRoutes = require('./auth')
const homeRoutes = require('./home')
const marvelRoutes = require('./marvel')

module.exports = (app) => {
    app.use('/auth', authRoutes)
    app.use('/home', homeRoutes)
    app.use('/marvel', marvelRoutes)

}