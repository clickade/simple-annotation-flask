/**
 * This is the main server script that will host the app and handle transactions between client and MongoDB
 */
const express = require('express')
const ParseServer = require('parse-server').ParseServer
//const crypto = require('crypto')

const app = express()
const masterKey = '23f2f258-4ce5-46ba-9e5d-2c9320b50044' //crypto.randomUUID()

// Our Parse API constructor
const api = new ParseServer({
    databaseURI: 'mongodb://localhost:27017/',
    appId: 'simple-img-annotation',
    masterKey,
    serverURL: 'http://localhost:3001/parse'
})

// Host app
app.use('/parse',api)
app.listen(3001,()=>{
    console.dir('Server running on port 3001')
})