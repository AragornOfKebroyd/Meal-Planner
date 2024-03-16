const express = require('express')
const router = express.Router()
const path = require('path')

// REGEX matches localhost:3500/, localhost:3500/index and localhost:3500/index.html
router.get('^/$|/index(.html)?', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'index.html'))
})

module.exports = router