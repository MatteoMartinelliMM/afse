const express = require('express')
const router = express.Router()
const authRepository = require('../repository/authRepository')

const users = [{
    nome: 'Pietro', cognome: 'Pacciani', email: 'pietropacciani@merende.com', password: 'senimmondo',
}, {
    nome: 'Mario', cognome: 'Vanni', email: 'mariovanni@merende.com', password: 'ritornemo!',
}]

router.post('/register', async (req, res) => {
    let u = req.body;
    if (u.name && u.surname && u.email && u.pwd && u.pwd.length > 0) {
        await authRepository.insertUser(u)
        res.status(200).json({message: 'stappost'})
        return null;
    }
    res.status(400).json({message: 'bad request'})
})

router.post('/login', async (req, res) => {
    let login = req.body;
    if (login.email && login.pwd && login.pwd.length > 0) {
        let user = await authRepository.findUserByCredentials(login)
        res.status(user ? 200 : 400).json({message: user ? 'stappost' : 'invalid username and pwd'})
        return null;
    }
    res.status(400).json({message: 'bad request'})
})

router.get('/', async (req, res) => {
    let users = await authRepository.findAllUsers()
    res.status(200).json(users)
});

router.get('/:id', async (req, res) => {
    let u = await authRepository.findUserById(req.params.id)
    res.status(u ? 200 : 404).json(u ? u : {message: 'User not found'})
});

router.delete('/:id', async (req, res) => {
    let result = await authRepository.deleteUserById(req.params.id)
    res.status(result ? 200 : 400).json({message: result ? 'User deleted successfully' : 'User not found'})
})

module.exports = router;