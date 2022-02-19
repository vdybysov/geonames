const express = require('express')
const router = express.Router()
const geo = require('../geo')

router.use('/', async (req, res) => {
    const query = req.query.q || ''
    let cities = []
    if (query.length > 1) {
        cities = await geo.searchCity(query[0].toUpperCase() + query.substring(1).toLowerCase())
    }
    res.json({ cities }).end()
})

module.exports = router