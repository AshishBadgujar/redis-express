const axios = require('axios')
const express = require('express')
const redis = require('redis')
const util = require('util')

const REDIS_URL = "redis://localhost:6379"
const client = redis.createClient({
    host: "localhost",
    port: 6379
})

client.set = util.promisify(client.set)  //for async actions
client.get = util.promisify(client.get)  //for async actions
const app = express();

app.use(express.json())

// app.post("/", async (req, res) => {
//     const { key, value } = req.body
//     const response = await client.set(key, value)
//     res.json(response)
// })


app.get('/posts/:id', async (req, res) => {
    const { id } = req.params;

    const cachedPost = await client.get(`post-${id}`)
    if (cachedPost) {
        return res.json(JSON.parse(cachedPost))
    }

    const response = await axios.get(`https://jsonplaceholder.typicode.com/posts/${id}`)
    client.set(`post-${id}`, JSON.stringify(response.data), "EX", 10)   //expires in 10 sec
    return res.json(response.data)
})

app.listen(8080, () => {
    console.log("hey i am running...")
})