const { MongoClient } = require('mongodb');
const express = require('express');
const Joi = require('joi');

app = express()
app.use(express.json()); //for json support

// Replace the uri string with your connection string.
const uri =
    'mongodb+srv://abhiroop25902:Abhiroopm25902@cluster1.yxbqg3u.mongodb.net/?retryWrites=true&w=majority';

// validate the request to have only {name: string} and noting else
function validateRequest(req_body) {
    const schema = Joi.object({
        name: Joi.string().required()
    })

    return schema.validate(req_body);
}


async function userCheck(req, res) {
    const { error } = validateRequest(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // NOTE: connection to DB does not happen here
    const client = new MongoClient(uri);

    try {
        // connection to DB happens in the next line
        const database = client.db('rock_paper_scissor');
        const users = database.collection('users');

        // check if the user is already present
        const query = {
            name: req.body.name
        };

        const result = await users.findOne(query);

        if (result)
            res.send(result);
        else { //else make a new user
            const newUserData = {
                name: req.body.name,
                win: 0,
                loss: 0
            }

            const result = await users.insertOne(newUserData);
            console.log(`New User Created with _id: ${result.insertedId}`);
            res.send(newUserData);

        }
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}

app.post('/', userCheck);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
