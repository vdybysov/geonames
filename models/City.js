const { Schema, model } = require('mongoose')

const city = new Schema({
    geoNameId: { type: Number, index: true },
    latitude: Number,
    longitude: Number,
    population: Number,
    admGeoNameId: { type: Number, index: true },
    timezone: String
})

city.virtual('adm', {
    ref: 'Adm',
    localField: 'admGeoNameId',
    foreignField: 'geoNameId',
    justOne: true
})

city.virtual('admCity', {
    ref: 'City',
    localField: 'admGeoNameId',
    foreignField: 'admGeoNameId',
    justOne: true,
    options: { sort: { population: -1 } }
})

city.virtual('name', {
    ref: 'Name',
    localField: 'geoNameId',
    foreignField: 'geoNameId',
    justOne: true
})

module.exports = model('City', city, 'cities')