//modules
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

//routes


//middlewares


//configs
const dbName = 'partytime';
const port = 3000;
const app = express();

app.use(cors());
app.use(express.static('public'));
app.use(express.urlencoded({extended:true}));
app.use(express.json());

//conexão mongodb
mongoose.connect(`mongodb://0.0.0.0:27017/${dbName}`)

app.get('/', (req, res) => {
    res.json({message: 'Rota teste!'})
})

app.listen(port, () => {
    console.log(`Backend rodando na port ${port}`)
})