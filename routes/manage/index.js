const express = require('express')
const router = express.Router()

router.use('/city', require('./city'))
router.use('/adm', require('./adm'))
router.use('/country', require('./country'))
router.use('/geoName', require('./geoName'))

module.exports = router