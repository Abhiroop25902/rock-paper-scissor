const express = require('express');
const cors = require('cors');
const users = require('./routes/users')
const matchmaking = require('./routes/matchmaking')
require('dotenv').config()

const app = express()

app.use(express.json()); //for json support
app.use(cors())
app.use('/users', users)
app.use('/matchmaking', matchmaking)

const port = process.env.PORT || 5000;
const server = app.listen(port,
    () => console.log(`Listening on port ${port}...`));

// server.keepAliveTimeout = 30000
