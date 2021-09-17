const { Schema, model } = require('mongoose')

const name = new Schema({
    geoNameId: { type: Number, index: true },
    name: { type: String, index: true },
    lang: String,
    preferred: { type: Boolean, index: true }
})

module.exports = model('Name', name, 'names')