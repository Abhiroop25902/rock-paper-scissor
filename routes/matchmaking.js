const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const EventEmitter = require('events');

router = express.Router()

const player_queue = []
const emitter = new EventEmitter();

async function getPlayer(id) {
    const dbClient = new MongoClient(process.env.DATABASE_URI);

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

        const result = await users.findOne(filter);

        return result;
    }
    finally {
        dbClient.close();
    }
}

router.post('/:id', async (req, res) => {
    const player = await getPlayer(req.params.id);

    if (!player) res.status(404).send();

    // first value is for proxy forwarded, it not proxy then remote address
    const request_ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    if (player_queue.length == 1 &&
        player_queue[0]._id !== req.params.id) //player already present 
    {
        res.send(player_queue[0]);
        player_queue.pop();
        player_queue.push({
            _id: player._id,
            name: player.name,
            ip: request_ip
        });
        emitter.emit('player found');
    }
    else {
        player_queue.push({
            _id: player._id,
            name: player.name,
            ip: request_ip
        })

        // res.send(player_queue);
        await new Promise(resolve => emitter.once('player found', resolve));

        res.send(player_queue[0]);
        player_queue.pop();
    }

})

module.exports = router