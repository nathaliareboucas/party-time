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

// get all public parties
router.get('/all', async (req, res) => {
    try {
        const publicParties = await Party.find({privacy: false}).sort([['_id', -1]])
        return res.json({data: publicParties})        
    } catch (err) {
        return res.status(500).json({err})
    }
})

// get all user parties
router.get('/userParties', verifyToken, async (req, res) => {
    try {
        const userByToken = await getUserByToken(req.header('Authorization'))
        const userId = userByToken._id.toString();
        const parties = await Party.find({userId: userId})
        return res.json({data: parties})
    } catch (err) {
        return res.status(500).json({err})
    }
})

// get user party
router.get('/userParty/:partyId', verifyToken, async (req, res) => {
    try {
        const userByToken = await getUserByToken(req.header('Authorization'))
        const partyId = req.params.partyId
        const userId = userByToken._id.toString()
        const party = await Party.findOne({_id: partyId, userId: userId})
        return res.json({data: party})
    } catch (err) {
        return res.status(400).json({message: 'Evento não encontrado!'})
    }
})

// get public party
router.get('/:partyId', async (req, res) => {
    const partyId = req.params.partyId
    try {
        const party = await Party.findOne({_id: partyId})

        if (party.privacy === true) {
            return res.json({message: 'Acesso negado'})
        } 

        return res.json({data: party})
    } catch (err) {
        return res.status(400).json({message: 'Evento não encontrado!'})
    }
})

// delete a party
router.delete('/:partyId', verifyToken, async (req, res) => {
    const partyId = req.params.partyId
    const userByToken = await getUserByToken(req.header('Authorization'))
    const userId = userByToken._id.toString()

    try {
        await Party.deleteOne({_id: partyId, userId: userId})
        return res.json({message: 'Evento removido com sucesso!'})
    } catch (err) {
        return res.status(400).json({err})
    }
})

// update a party
router.put('/:partyId', verifyToken, upload.fields([{name: 'photos'}]), async (req, res) => {
    const partyReq = req.body
    const partyId = req.params.partyId

    let files = []

    if (req.files) {
        files = req.files.photos
    }

    if (partyReq.title == null || partyReq.description == null || 
        partyReq.partyDate == null || partyReq.privacy == null) {
            return res.status(400).json({error: 'Título, descrição, data da festa e privacidade são obrigatórios!'})
    }

    const userByToken = await getUserByToken(req.header('Authorization'))
    const userId = userByToken._id.toString()
    if (partyReq.userId != null && partyReq.userId != userId) {
        return res.status(401).json({message: 'Acesso negado!'})
    }

    let photos = []
    if (files && files.length > 0) {
        files.forEach((photo, i) => {
            photos[i] = photo.path
        })
        partyReq.photos = photos
    }

    try {
        const updatedParty = await Party.findOneAndUpdate({_id: partyId, userId: userId}, {$set: partyReq}, {new: true})
        return res.json({message: 'Evento atualizado com sucesso!', data: updatedParty})
    } catch (err) {
        return res.status(500).json({err})
    }
})

module.exports = router
