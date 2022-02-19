const express = require('express')
const Country = require('../../models/Country')
const Name = require('../../models/Name')
const { upsertName, upsert } = require('../../utils/db')
const router = express.Router()

router.get('/', async (req, res) => {
    const { query } = req.query

    if (!query) {
        return res.json({ list: [] }).end()
    }

    const names = await Name.find({
        name: new RegExp(`^${query}`)
    }).limit(1000)

    let results = {}

    for (name of names) {
        const country = await Country.findOne({ geoNameId: name.geoNameId })
            .populate('name')
        if (!country || !country.name) {
            continue
        }
        const {
            name: { name: countryName },
            geoNameId,
            code
        } = country
        if (!results[geoNameId] || !results[geoNameId].name.preferred) {
            results[geoNameId] = {
                geoNameId,
                name: countryName,
                code
            }
        }
    }

    res.json({
        list: Object.values(results)
            .slice(0, 100)
    }).end()
})

router.post('/', async (req, res) => {

    const country = req.body

    if (!country.geoNameId) {
        return res.status(400).json({ error: 'NoGeoNameId' })
    }

    if (!country.code) {
        return res.status(400).json({ error: 'NoCode' })
    }

    country.geoNameId = +country.geoNameId

    upsertName(country.geoNameId, country.name)
    upsert(Country, country)

    res.json({}).end()
})

router.delete('/', async (req, res) => {

    const { geoNameIds } = req.query

    if (!geoNameIds?.length) {
        return res.status(400).json({ error: 'NoGeoNameIds' })
    }

    await Country.deleteMany({ geoNameId: { $in: geoNameIds } })

    res.json({}).end()
})

module.exports = router