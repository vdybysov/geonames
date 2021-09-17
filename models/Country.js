const { Schema, model } = require('mongoose')

const country = new Schema({
    geoNameId: Number,
    code: { type: String, index: true }
})

country.virtual('name', {
    ref: 'Name',
    localField: 'geoNameId',
    foreignField: 'geoNameId',
    justOne: true,
    match: { preferred: true }
})

module.exports = model('Country', country, 'countries')