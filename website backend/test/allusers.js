const { query } = require('../controllers/databaseController')

const allusers = (req, res) => {
    const rows = query('SELECT * FROM user')
    console.log(rows)
    res.json({"users": rows})
}

module.exports = allusers