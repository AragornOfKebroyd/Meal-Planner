const express = require('express')
const router = express.Router()
const { testingFunction, test2, rows } = require('../test/testingFunction')
const allusers = require('../test/allusers')
const testhash = require('../test/testhash')
const testadd = require('../test/add_to_db')

router.route('/')
    .all(testingFunction)

router.route('/test')
    .get(test2)

router.route('/rows')
    .get(rows)

router.route('/users')
    .all(allusers)

router.route('/hash')
    .all(testhash)

router.route('/add')
    .all(testadd)

module.exports = router