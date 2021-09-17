const mongoose = require('mongoose')
const fs = require('fs')
const readline = require('readline')
const dotenv = require('dotenv')
const Country = require("./models/Country")
const Adm = require("./models/Adm")
const City = require("./models/City")
const Name = require('./models/Name')

dotenv.config()

function readFile(path) {
    return readline.createInterface({
        input: fs.createReadStream(path),
        crlfDelay: Infinity
    })
}

async function populate() {

    await mongoose.connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })

    await Name.deleteMany()

    const names = []

    const namesFile = readFile('raw/alternateNames.txt')

    for await (line of namesFile) {
        let [, geoNameId, lang, name, preferred] = line.split('\t')
        geoNameId = +geoNameId
        if(!geoNameId || lang !== 'ru') {
            continue
        }
        lang = lang.toUpperCase()
        names[geoNameId] = names[geoNameId] || []
        names[geoNameId].push({ geoNameId, lang, name, preferred: preferred === '1' })
    }

    console.log(`Read names for ${Object.keys(names).length} ids.`)

    await Country.deleteMany()

    const countryFile = readFile('raw/countryInfo.txt')

    for await (line of countryFile) {
        if (line[0] === '#') {
            continue
        }
        const split = line.split('\t')
        const code = split[0]
        const geoNameId = +split[16];
        if (code && geoNameId) {
            await Country.create({ code, geoNameId })
            if (names[geoNameId] && names[geoNameId].length) {
                await Name.create(names[geoNameId])
            }
        }
    }

    console.log(`Saved ${await Country.countDocuments()} countries.`)

    await Adm.deleteMany()

    const admFile = readFile('raw/admin1CodesASCII.txt')

    const admIds = {}

    for await (line of admFile) {
        if (line[0] === '#') {
            continue
        }
        const split = line.split('\t')
        const fullCode = split[0]
        const [countryCode, code] = fullCode.split('.')
        const geoNameId = +split[3]
        await Adm.create({
            geoNameId, countryCode, code
        })
        admIds[fullCode] = geoNameId
        if (names[geoNameId] && names[geoNameId].length) {
            await Name.create(names[geoNameId])
        }
    }

    console.log(`Saved ${await Adm.countDocuments()} adms.`)

    await City.deleteMany()

    const citiesFile = readFile('raw/cities500.txt')

    for await (line of citiesFile) {
        if (line[0] === '#') {
            continue
        }
        const split = line.split('\t')
        const geoNameId = split[0];
        const latitude = +split[4];
        const longitude = +split[5];
        const countryCode = split[8];
        const adm1Code = split[10];
        const population = +split[14];
        const timezone = split[17];
        const admGeoNameId = admIds[`${countryCode}.${adm1Code}`]
        if(!admGeoNameId) {
            continue
        }
        await City.create({
            geoNameId, latitude, longitude, admGeoNameId, population, timezone
        })
        if (names[geoNameId] && names[geoNameId].length) {
            await Name.create(names[geoNameId])
        }
    }

    console.log(`Saved ${await City.countDocuments()} cities.`)
}

populate()