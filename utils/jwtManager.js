const jwt = require('jsonwebtoken');

function getToken(id) {
    const token = jwt.sign({id: id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXP_TIME, audience: process.env.JWT_AUDIENCE, issuer: process.env.JWT_ISSUER
    })
    console.log(token)
    return token;
}

function verifyToken(req, res, next) {
    console.log(req.cookies.jwt)

    jwt.verify(req.cookies.jwt, process.env.JWT_SECRET, (err, authData) => {
        if (err) {
            console.log('User does not have a valid jwt token')
            //todo redirect to login
            res.status(403).json({error: 'User not logged'})
            return;
        }
        console.log(authData)
        req.userId = authData.id;
        next()
    })
}

module.exports = {
    getToken: getToken, verifyToken: verifyToken,
}