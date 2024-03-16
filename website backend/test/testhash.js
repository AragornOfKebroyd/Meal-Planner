const { hashPassword } = require('../util/password')

const testhash = (req, res) => {
    const one = hashPassword('hello&There2')
    
    res.json(one)
}

module.exports = testhash