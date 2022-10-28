const { MongoClient, ObjectId } = require('mongodb');
const express = require('express');
const Joi = require('joi');

// Using this link as a guideline about what to do
// https://www.restapitutorial.com/lessons/httpmethods.html

router = express.Router()

// validate the request to have only {name: string} and noting else
function validatePostRequest(req_body) {
    const schema = Joi.object({
        name: Joi.string().required()
    })

    return schema.validate(req_body);
}

router.post('/', async (req, res) => {
    const { error } = validatePostRequest(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // NOTE: connection to DB does not happen here
    const dbClient = new MongoClient(process.env.DATABASE_URI);

    try {
        // connection to DB happens in the next line
        const database = dbClient.db('rock_paper_scissor');
        const users = database.collection('users');

        // check if the user is already present
        const filter = {
            name: req.body.name
        };

        const result = await users.findOne(filter);

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
            res.status(201).send(newUserData); // 201 created

        }
    } finally {
        // Ensures that the client will close when you finish/error
        await dbClient.close();
    }
});

router.get('/', async (req, res) => {
    //expecting page query in link for pagination
    const page = req.query.page || 1;
    const LIMIT_SIZE = 2;

    const dbClient = new MongoClient(process.env.DATABASE_URI);

    try {
        // connection to DB happens in the next line
        const database = dbClient.db('rock_paper_scissor');
        const users = database.collection('users');

        const cursor = users.find({}).skip((page - 1) * LIMIT_SIZE).limit(LIMIT_SIZE);
        const data = await cursor.toArray();
        await cursor.close();
        res.status(200).send(data);

    } finally {
        await dbClient.close();
    }
})

router.get('/:id', async (req, res) => {
    const dbClient = new MongoClient(process.env.DATABASE_URI);

    const id = req.params.id
    //check id to be of 24 characters
    if (id.length !== 24) {
        res.status(404).send();
        return;
    }

    try {
        // connection to DB happens in the next line
        const database = dbClient.db('rock_paper_scissor');
        const users = database.collection('users');
        const filter = {
            _id: new ObjectId(id)
        }
        const user = await users.findOne(filter);
        if (user)
            res.send(user);
        else
            res.status(404).send();
    }
    finally {
        dbClient.close();
    }
})

router.put('/', (req, res) => {
    res.status(405).send();
})

function validatePutRequest(req_body) {
    const schema = Joi.object({
        name: Joi.string().required(),
        win: Joi.number().required(),
        loss: Joi.number().required()
    })

    return schema.validate(req_body);
}

router.put('/:id', async (req, res) => {
    const id = req.params.id;
    //check id to be of 24 characters
    if (id.length !== 24) {
        res.status(404).send();
        return;
    }

    const { error } = validatePutRequest(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const dbClient = new MongoClient(process.env.DATABASE_URI);


    try {
        // connection to DB happens in the next line
        const database = dbClient.db('rock_paper_scissor');
        const users = database.collection('users');

        const filter = {
            _id: new ObjectId(id)
        }

        const options = {
            returnDocument: 'after'
        }

        const result = await users.findOneAndReplace(filter, req.body, options)
        if (result.value)
            res.send(result.value);
        else
            res.status(404).send();
    }
    finally {
        dbClient.close();
    }
})

router.patch('/', (req, res) => {
    res.status(405).send();
})

function validatePatchRequest(req_body) {
    const schema = Joi.object({
        name: Joi.string(),
        win: Joi.number(),
        loss: Joi.number()
    })

    return schema.validate(req_body);
}

router.patch('/:id', async (req, res) => {
    const id = req.params.id;
    //check id to be of 24 characters
    if (id.length !== 24) {
        res.status(404).send();
        return;
    }

    const { error } = validatePatchRequest(req.body);
    if (error)
        return res.status(400).send(error.details[0].message);

    const dbClient = new MongoClient(process.env.DATABASE_URI);

    try {
        // connection to DB happens in the next line
        const database = dbClient.db('rock_paper_scissor');
        const users = database.collection('users');

        const filter = {
            _id: new ObjectId(id)
        }

        const update = {
            $set: req.body
        }
        const options = {
            returnDocument: 'after'
        }

        const result = await users.findOneAndUpdate(
            filter,
            update,
            options
        )

        if (result.value)
            res.send(result.value);
        else
            res.status(404).send();
    }
    finally {
        dbClient.close();
    }
})

router.delete('/', (req, res) => {
    res.status(405).send();
})

router.delete('/:id', async (req, res) => {
    const id = req.params.id;
    //check id to be of 24 characters
    if (id.length !== 24) {
        res.status(404).send();
        return;
    }

    const dbClient = new MongoClient(process.env.DATABASE_URI);

    try {
        // connection to DB happens in the next line
        const database = dbClient.db('rock_paper_scissor');
        const users = database.collection('users');

        const filter = {
            _id: new ObjectId(id)
        }

        const deleteResult = await users.deleteOne(filter)

        if (deleteResult.deletedCount === 0)
            res.status(404).send();
        else
            res.status(204).send(deleteResult);

    }
    finally {
        dbClient.close();
    }
})

module.exports = router;
