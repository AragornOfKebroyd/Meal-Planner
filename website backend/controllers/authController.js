const { checkPassword, hashPassword } = require('../util/password')
const { queryOne, execute, query } = require('./databaseController')

const loginController = (req, res) => {
    // validate the input
    if (!req?.body?.username || !req?.body?.password) {
        return res.status(400).json({'message': 'username and password are required'})
    }
    const {username, password} = req.body

    // Check user exists
    const user = queryOne('SELECT * FROM user WHERE username = ?', [username])
    if (!user) {
        res.status(400)
        res.json({'message': 'User does not exist'})
        return
    }

    // check if the password is correct
    const correct = checkPassword(password, user.userID)
    if (correct) {
        res.json({ 'auth_token': 0, 'userID': user.userID })
    } else {
        res.status(401)
        res.json({'message': 'Incorrect Password'})
    }
}

const registerController = (req, res) => {
    // validate the input
    if (!req?.body?.username || !req?.body?.password) {
        return res.status(400).json({'message': 'username and password are required'})
    }
    const { username, password } = req.body
    
    // The password will have been hashed once on the users end, but we need to hash it again in case it was intercepted in transit
    
    const doubleHashed = hashPassword(password)
    
    // Check if user exists
    const info = queryOne('SELECT * FROM user WHERE username = ?', [username])

    if (info) {
        res.status(400)
        return res.json({'message': `There is allready a user with the username ${username}`})
    }

    // add a new user into the database
    const data = execute('INSERT INTO user (username, password_hash) VALUES (?, ?)', [username, doubleHashed])

    
    res.status(200).json({'message': `userID: ${data.lastInsertRowid}`})
}

const logoutController = (req, res) => {
    if (!req?.body?.userID) {
        return res.status(400).json({'message': 'userID is required'})
    }
    const userID = req.body.userID
    execute('UPDATE user SET auth_token = NULL WHERE userID = ?', [userID])

    res.status(200).json({ 'message': 'success' })
}

const changePasswordController = (req, res) => {
    if (!req?.body?.userID) return res.status(400).json({ 'message': 'userID is required' })
    if (!req?.body?.password) return res.status(400).json({ 'message': 'password is required' })
    if (!req?.body?.newPassword) return res.status(400).json({ 'message': 'newPassword is required' })
    const userID = req.body.userID
    const password = req.body.password
    const newPassword = req.body.newPassword

    if (!checkPassword(password, userID)) {
        return res.status(401).json({ 'message': 'Incorrect Password' })
    }

    const hashed = hashPassword(newPassword)

    execute('UPDATE user SET password_hash = ? WHERE userID = ?', [hashed, userID])

    res.status(200).json({ 'message': 'success' })
}

module.exports = { 
    loginController,
    registerController,
    logoutController,
    changePasswordController
}