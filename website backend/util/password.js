const bcrypt = require('bcrypt')
const { query } = require('../controllers/databaseController')
const SALT_ROUNDS = 12

const checkPassword = (password, userID) => {
    const user = query('SELECT * FROM user WHERE userID = ?', [userID])[0]
    
    const valid = bcrypt.compareSync(password, user.password_hash)
    return valid
}

const hashPassword = (password) => {
    if (typeof password !== 'string') {
        throw new TypeError('Password Must be a string')
    }
    const hash = bcrypt.hashSync(password, SALT_ROUNDS)
    return hash
}

module.exports = { checkPassword, hashPassword }