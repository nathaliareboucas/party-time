const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

// register an user
router.post('/register', async (req, res) => {
    const userReq = req.body;

    if (userReq.name == null || userReq.email == null 
            || userReq.password == null || userReq.confirmPassword == null) {
        return res.status(400).json({error: "Por favor, preencha todos os campos!"})
    }

    if (userReq.password !== userReq.confirmPassword) {
        return res.status(400).json({error: "As senhas não conferem!"})
    }

    const existingEmail = await User.findOne({email: userReq.email})
    if (existingEmail) {
        return res.status(400).json({error: "O e-mail informado já está em uso!"})
    }

    const salt = await bcrypt.genSalt(12)
    const password = await bcrypt.hash(userReq.password, salt)
    userReq.password = password
    const user = new User(userReq)

    try {
        const newUser = await user.save()
        const token = jwt.sign({
            name: newUser.name,
            id: newUser._id
        }, 'nossoSecret')

        res.status(201).json({message: "Você realizou o cadastro com sucesso", userId: newUser._id, token: token})
    } catch (error) {
        res.status(400).json({error})
    }
})

// login an user
router.post('/login', async (req, res) => {
    const loginUserReq = req.body

    if (loginUserReq.email == null || loginUserReq.password == null) {
        return res.status(400).json({error: "Por favor, preencha todos os campos!"})
    }

    const existingUser = await User.findOne({email: loginUserReq.email})
    if (!existingUser) {
        return res.status(400).json({error: "Não há um usuário cadastrado com este e-mail!"})
    }

    const checkPassword = await bcrypt.compare(loginUserReq.password, existingUser.password)
    if (!checkPassword) {
        return res.status(401).json({error: "Acesso negado!"})
    }

    const token = jwt.sign({
        name: existingUser.name,
        id: existingUser._id
    }, 'nossoSecret')

    res.status(200).json({message: "Login realizado com sucesso!", userId: existingUser._id, token: token})
})

module.exports = router;