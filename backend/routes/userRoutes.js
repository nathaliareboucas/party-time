const router = require('express').Router();
const bcrypt = require('bcrypt');

const User = require('../models/user');
const verifyToken = require('../helpers/check-token');

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

module.exports = router;