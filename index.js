const express = require('express');
const cors = require('cors');
const users = require('./routes/users')

app = express()

app.use(express.json()); //for json support
app.use(cors())
app.use('/users', users)

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
