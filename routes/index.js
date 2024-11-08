const authRoutes = require('./auth')
const homeRoutes = require('./homeRoutes')
const marvelRoutes = require('./marvel')
const shopRoutes = require('./shopRoutes')
const userRoutes = require('./userRoutes')
const marketplaceRoutes = require('./marketplace')

module.exports = (app) => {
    app.use('/auth', authRoutes)
    app.use('/home', homeRoutes)
    app.use('/marvel', marvelRoutes)
    app.use('/shop', shopRoutes)
    app.use('/user', userRoutes)
    app.use('/marketplace', marketplaceRoutes)
}