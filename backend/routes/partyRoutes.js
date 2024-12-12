const router = require('express').Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');

const Party = require('../models/party');
const User = require('../models/user');
const verifyToken = require('../helpers/check-token');
const getUserByToken = require('../helpers/get-user-by-token');
const diskStorage = require('../helpers/file-storage');
const upload = multer({storage: diskStorage})

// create new party
router.post('/', verifyToken, upload.fields([{name: 'photos'}]), async (req, res) => {
    const title = req.body.title
    const description = req.body.description
    const partyDate = req.body.partyDate
    const privacy = req.body.privacy
    let files = []

    if (req.files) {
        files = req.files.photos
    }

    if (title == null || description == null || partyDate == null || privacy == null) {
        return res.status(400).json({error: 'Título, descrição, data da festa e privacidade são obrigatórios!'})
    }

    const token = req.header('Authorization')
    const userByToken = await getUserByToken(token)
    const userId = userByToken._id.toString()
    try {
        const user = await User.findOne({_id: userId})        
        let photos = []

        // create photos array with image path
        if (files && files.length > 0) {
            files.forEach((photos, i) => {
                photos[i] = photo.path
            });
        }

        const party = new Party({
            title: title,
            description: description,
            partyDate: partyDate,
            photos: photos,
            privacy: privacy,
            userId: user._id.toString()
        })

        const newParty = await party.save()
        return res.json({message: 'Evento criado com sucesso', data: newParty})
    } catch (err) {
        return res.status(500).json({err})
    }
})

module.exports = router
