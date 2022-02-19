const express = require('express')
const City = require('../../models/City')
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
        const city = await City.findOne({ geoNameId: name.geoNameId })
            .populate('name')
            .populate({
                path: 'adm',
                populate: [{
                    path: 'country',
                    populate: 'name'
                }, 'name']
            })
        if (!city || !city.name || !city.adm || !city.adm.country) {
            continue
        }
        const {
            name: { name: cityName },
            geoNameId,
            latitude,
            longitude,
            population,
            timezone,
            admGeoNameId,
            adm
        } = city
        if (!results[city.geoNameId] || !results[city.geoNameId].name.preferred) {
            results[city.geoNameId] = {
                geoNameId,
                name: cityName,
                latitude,
                longitude,
                population,
                timezone,
                adm: {
                    geoNameId: admGeoNameId,
                    name: adm.name?.name
                },
                country: {
                    geoNameId: adm.country.geoNameId,
                    name: adm.country.name.name,
                }
            }
        }
    }

    res.json({
        list: Object.values(results)
            .sort((a, b) => b.population - a.population)
            .slice(0, 100)
    }).end()
})

router.post('/', async (req, res) => {

    const city = req.body

    if (!city.geoNameId) {
        return res.status(400).json({ error: 'NoGeoNameId' })
    }

    if (!city.adm || !city.adm.geoNameId) {
        return res.status(400).json({ error: 'NoAdm' })
    }

    city.geoNameId = +city.geoNameId;
    city.population = +city.population || 0
    city.latitude = +city.latitude || 0
    city.longitude = +city.longitude || 0
    city.admGeoNameId = city.adm.geoNameId

    delete city.adm

    await upsertName(city.geoNameId, city.name)
    await upsert(City, city)

    res.json({}).end()
})

router.delete('/', async (req, res) => {

    const { geoNameIds } = req.query

    if (!geoNameIds?.length) {
        return res.status(400).json({ error: 'NoGeoNameIds' })
    }

    await City.deleteMany({ geoNameId: { $in: geoNameIds } })

    res.json({}).end()
})

module.exports = router