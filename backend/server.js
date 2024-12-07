//modules
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

//routes
const authRouter = require('./routes/authRoutes');

//middlewares


//configs
const dbName = 'partytime';
const port = 3000;
const app = express();

app.use(cors());
app.use(express.static('public'));
app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.use('/api/auth', authRouter);

//conexão mongodb
mongoose.connect(`mongodb://0.0.0.0:27017/${dbName}`)

app.get('/', (req, res) => {
    res.json({message: 'Rota teste!'})
})

app.listen(port, () => {
    console.log(`Backend rodando na port ${port}`)
})