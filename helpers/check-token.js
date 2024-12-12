const jwt = require('jsonwebtoken');

// middleware to validate token
const checkToken = (req, res, next) => {
    const token = req.header('Authorization')

    if (!token) {
        return res.status(401).json({error: 'Acesso negado!'})
    }

    try {
        const verified = jwt.verify(token, 'nossoSecret')
        req.user = verified
        next()
    } catch (err) {
        res.status(498).json({error: 'Token inválido!'})
    }
}

module.exports = checkToken