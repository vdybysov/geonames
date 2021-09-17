const mongoose = require('mongoose')
const dotenv = require('dotenv')
const Country = require("./models/Country")
const Adm = require("./models/Adm")
const City = require("./models/City")
const Name = require('./models/Name')

dotenv.config()

async function migrateCrimea() {

    await mongoose.connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })

    await Country.deleteMany({ code: 'CRI ' })
    await Country.create({
        geoNameId: 9000000,
        code: 'CRI'
    })

    await Name.deleteMany({
        geoNameId: 9000000
    })

    await Name.create({
        geoNameId: 9000000,
        name: 'Крым',
        lang: 'RU',
        preferred: true
    })

    await Adm.updateOne({ geoNameId: 703883 }, { $set: { countryCode: 'CRI', code: '01' } }) // Респ. Крым
    await Adm.updateOne({ geoNameId: 698738 }, { $set: { countryCode: 'CRI', code: '02' } }) // Одесская область

    process.exit(0)
}

migrateCrimea()