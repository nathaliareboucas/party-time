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

module.exports = router;