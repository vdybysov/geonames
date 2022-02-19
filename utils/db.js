const Name = require("../models/Name")

const upsert = async (model, item) => {
    const existing = await model.findOne({ geoNameId: item.geoNameId })
    if (existing) {
        await model.updateOne({ _id: existing._id }, item)
    } else {
        await model.create(item)
    }
}

const upsertName = async (geoNameId, name) => {
    const existing = await Name.findOne({ geoNameId });
    if (existing) {
        await Name.updateOne({ _id: existing._id }, { $set: { name } })
    } else {
        if (!name) {
            return res.status(400).json({ error: 'NoName' })
        }
        await Name.create({
            geoNameId,
            name,
            lang: 'RU',
            preferred: true
        })
    }
}

module.exports = { upsert, upsertName }