const { Schema, model } = require('mongoose')

const adm = new Schema({
    geoNameId: { type: Number, index: true},
    code: String,
    countryCode: String
})

adm.virtual('country', {
    ref: 'Country',
    localField: 'countryCode',
    foreignField: 'code',
    justOne: true
})

adm.virtual('name', {
    ref: 'Name',
    localField: 'geoNameId',
    foreignField: 'geoNameId',
    justOne: true,
    options: { sort: { preferred: -1 } }
})

module.exports = model('Adm', adm, 'adm')