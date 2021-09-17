const mongoose = require('mongoose')
require("./models/Adm")
require("./models/Country")
const City = require("./models/City")
const Name = require('./models/Name')

function init({ mongoUrl }) {
    return mongoose.connect(mongoUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
}

async function searchCity(query) {

    const names = await Name.find({
        name: new RegExp(`^${query}`)
    })

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
        if (!city || !city.name || !city.adm || !city.adm.name) {
            continue
        }
        const {
            latitude,
            longitude,
            population,
            timezone,
            admGeoNameId,
            adm: { name: { name: adm }, country: { name: { name: country } } }
        } = city
        if (!results[city.geoNameId] || !results[city.geoNameId].name.preferred) {
            results[city.geoNameId] = {
                name, latitude, longitude, population, timezone, admGeoNameId, adm, country
            }
        }
    }

    results = Object.values(results)
        .map(({ name: { name }, ...item }) => ({
            name,
            ...item
        }))
        .sort((a, b) => b.population - a.population)
        .slice(0, 20)

    for (item of results) {
        const admCity = await City.findOne({ admGeoNameId: item.admGeoNameId }).sort({ population: -1 })
            .populate('name')
        if (admCity && admCity.name) {
            item.admCity = admCity.name.name
        }
        delete item.admGeoNameId
    }

    return results
}

module.exports = { init, searchCity }