const express = require('express')
const Adm = require('../../models/Adm')
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
    }).limit(500)

    let results = {}

    for (name of names) {
        const adm = await Adm.findOne({ geoNameId: name.geoNameId })
            .populate('name')
            .populate({
                path: 'country',
                populate: 'name'
            })
        if (!adm || !adm.name || !adm.country) {
            continue
        }
        const {
            name: { name: admName },
            geoNameId,
            country
        } = adm
        if (!results[geoNameId] || !results[geoNameId].name.preferred) {
            results[geoNameId] = {
                geoNameId,
                name: admName,
                country: {
                    geoNameId: country.geoNameId,
                    name: country.name.name,
                }
            }
        }
    }

    res.json({
        list: Object.values(results)
            .slice(0, 100)
    }).end()
})

router.post('/', async (req, res) => {

    const adm = req.body

    if (!adm.geoNameId) {
        return res.status(400).json({ error: 'NoGeoNameId' })
    }

    if (!adm.country || !adm.country.code) {
        return res.status(400).json({ error: 'NoCountry' })
    }

    adm.geoNameId = +adm.geoNameId
    adm.countryCode = adm.country.code

    delete adm.country

    await upsertName(adm.geoNameId, adm.name)
    await upsert(Adm, adm)

    res.json({}).end()
})

router.delete('/', async (req, res) => {

    const { geoNameIds } = req.query

    if (!geoNameIds?.length) {
        return res.status(400).json({ error: 'NoGeoNameIds' })
    }

    await Adm.deleteMany({ geoNameId: { $in: geoNameIds } })

    res.json({}).end()
})

module.exports = router