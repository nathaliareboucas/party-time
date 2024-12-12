const router = require('express').Router();
const bcrypt = require('bcrypt');

const User = require('../models/user');
const verifyToken = require('../helpers/check-token');
const getUserByToken = require('../helpers/get-user-by-token')

// get an user
router.get('/:id', verifyToken, async (req, res) => {
    const id = req.params.id
    try {
        const existingUser = await User.findOne({_id: id}, {password: 0})
        return res.status(200).json(existingUser)
    } catch (error) {
        return res.status(400).json({error: "Usuário não existe!"})
    }
})

// update an user
router.put('/', verifyToken, async (req, res) => {
    const token = req.header('Authorization')
    const user = await getUserByToken(token)
    const userId = user._id.toString()
    const userReq = req.body
    
    if (userId != userReq.id) {
        return res.status(401).json({error: 'Acesso negado!'})
    }

    if (userReq.name == null || userReq.email == null) {
        return res.status(400).json({error: "Nome e email são obrigatórios!"})
    }    

    const updateData = {
        name: userReq.name,
        email: userReq.email
    }

    // check if passwords match
    if (userReq.password != userReq.confirmPassword) {
        return res.status(400).json({error: 'As senhas não conferem!'})
    } else if (userReq.password == userReq.confirmPassword && userReq.password != null) {
        const salt = await bcrypt.genSalt(12)
        const passwordHash = await bcrypt.hash(userReq.password, salt)
        userReq.password = passwordHash
    }

    try {
        const updatedUser = await User.findOneAndUpdate({_id: userId}, {$set: userReq}, {new: true})
        return res.json({message: 'Usuário atualizado com sucesso', data: updatedUser})
    } catch (err) {
        return res.status(500).json({err})
    }
})

module.exports = router;