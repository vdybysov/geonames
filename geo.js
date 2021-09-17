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

    const results = {}

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
            .populate({
                path: 'admCity',
                populate: 'name'
            })
        if (!city || !city.name || !city.adm || !city.admCity) {
            continue
        }
        const {
            latitude,
            longitude,
            population,
            timezone,
            admCity: { name: { name: admCity } },
            adm: { name: { name: adm }, country: { name: { name: country } } }
        } = city
        if (!results[city.geoNameId] || !results[city.geoNameId].name.preferred) {
            results[city.geoNameId] = {
                name, latitude, longitude, population, timezone, adm, admCity, country
            }
        }
    }

    return Object.values(results)
        .map(({ name: { name }, ...item }) => ({
            name,
            ...item
        }))
        .sort((a, b) => b.population - a.population)
}

module.exports = { init, searchCity }