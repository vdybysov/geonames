const dotenv = require('dotenv')
const geo = require('./geo')
const express = require('express')
const cors = require('cors')
const app = express()

dotenv.config()

app.use(express.json({ extended: true }))
app.use(cors())

app.use('/city', require('./routes/city'))
app.use('/manage', require('./routes/manage'))

app.use(async (err, req, res, next) => {
    if (res.headersSent) {
        return next(err)
    }
    console.error(err)
    res.status(500).json({ error: 'Internal error' })
})

async function start() {
    await geo.init({
        mongoUrl: process.env.MONGO_URL
    })
    const port = process.env.PORT || 9600
    app.listen(port, () => console.log(`Server listening on http://localhost:${port}`))
}

start()