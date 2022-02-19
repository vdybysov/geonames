const express = require('express')
const Adm = require('../../models/Adm')
const City = require('../../models/City')
const Country = require('../../models/Country')
const Name = require('../../models/Name')
const router = express.Router()

const MIN_ID = 100000000

router.use('/nextId', async (req, res) => {

    const lastId = [
        await City.findOne({ geoNameId: { $gt: MIN_ID } }, { geoNameId: 1 }).sort({ geoNameId: 'desc' }),
        await Adm.findOne({ geoNameId: { $gt: MIN_ID } }, { geoNameId: 1 }).sort({ geoNameId: 'desc' }),
        await Country.findOne({ geoNameId: { $gt: MIN_ID } }, { geoNameId: 1 }).sort({ geoNameId: 'desc' }),
        await Name.findOne({ geoNameId: { $gt: MIN_ID } }, { geoNameId: 1 }).sort({ geoNameId: 'desc' })
    ]
        .filter(item => !!item)
        .map(({ geoNameId }) => geoNameId)
        .reduce((max, curr) => curr > max ? curr : max, MIN_ID)

    res.json({
        nextId: lastId + 1
    }).end()
})

module.exports = router