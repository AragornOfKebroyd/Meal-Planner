const { hashPassword } = require('../util/password')
const { execute, queryOne, query } = require('./databaseController') 

const { _ } = require('lodash')

// May be useful     const optionsString = Object.keys(options).map(key => `${key}${options[key].operator}${options[key].value}`).join(", ");

const getUserData = (userID) => {
    const user = queryOne('SELECT * FROM user WHERE userID = ?', [userID])
    if (!user) {
        throw new Error(`user with userID ${userID} does not exist`)
    }
    const tags = query(`SELECT * FROM user_tags WHERE userID = ?`, [userID])

    const excluded_ingredients = query("SELECT user_excluded_ingredients.name, GROUP_CONCAT(user_excluded_ingredients.ingredientID, ',') as ingredientIDs, GROUP_CONCAT(ingredient.name, ', ') as ingredientNames FROM user_excluded_ingredients JOIN ingredient ON user_excluded_ingredients.ingredientID = ingredient.ingredientID WHERE userID = ? GROUP BY user_excluded_ingredients.name", [userID])

    // security
    delete user.password_hash
    delete user.auth_token

    const userData = { 
        'user': user, 
        'tags': tags, 
        'excluded_ingredients': excluded_ingredients.map(ing => { return {
            ...ing, 
            'ingredientIDs': ing.ingredientIDs.split(',').map(n => Number(n)),
        }})
    }

    return userData
}

const getUserDataController = (req, res) => {
    // validate input
    if (!req?.params?.userID) {
        return res.status(400).json({ 'message': 'user/userID needed' })
    }
    const { userID } = req.params

    try {
        const userData = getUserData(userID)
        res.json(userData)
    } catch (err) {
        return res.status(400).json({ 'message': err.message })
    }
}

const getAllUserDataController = (req, res) => {
    const { options } = req.body
    if (!options || Object.keys(options).length === 0 ) {
        var optionsString = ''
    } else {
        var optionsString = " WHERE " + Object.keys(options).map(key => `${key} ${options[key].operator} ${options[key].value}`).join(" AND ")
    }
    
    // TODO add validation that all options are valid

    const users = query(`SELECT * FROM user${optionsString}`)

    const publicUsers = users.map(user => {
        delete user.password_hash
        delete user.auth_token
        return user
    })
    
    res.json( publicUsers )
}

const updateUserDataController = (req, res) => {
    // validate input
    if (!req?.params?.userID) {
        return res.status(400).json({ 'message': 'user/userID needed' })
    }
    if (!req?.body?.user) return res.status(400).json({ 'message': 'user field needed' })
    if (!req?.body?.excluded_ingredients) return res.status(400).json({ 'message': 'excluded_ingredients field needed' })

    const { userID } = req.params
    const { user: options, excluded_ingredients, password } = req.body
    
    const userExists = queryOne('SELECT * FROM user WHERE userID = ?', [userID])
    // Check if user exists
    if (!userExists) {
        return res.status(400).json({'message': `There is no user with userID ${userID}`})
    }

    if (Object.keys(options).length === 0) {
        res.status(400)
        res.json('No options provided')
        return
    }

    if (password) {
        const password_hash = hashPassword(password)
        options.password_hash = password_hash
    }

    const optionsString = Object.keys(options).map(key => `${key}=${typeof(options[key]) == 'string' ? `'${options[key].replaceAll('\'', '\'\'')}'`: options[key]}`).join(", ");
    
    // TODO add validation that options are valid

    const updates = execute(`UPDATE user SET ${optionsString} WHERE userID = ?`, [userID])

    const atomised = [].concat(...excluded_ingredients.map(ingredient => {
        const IDs = ingredient.ingredientIDs
        return IDs.map(id => {return { name: ingredient.name, ingredientID: id}} )
    }))

    const allready = query('SELECT name, ingredientID FROM user_excluded_ingredients WHERE userID = ?', [userID])

    const toAdd = atomised.filter(ingredient => allready.filter(ingredient2 => _.isEqual(ingredient, ingredient2)).length === 0)
    const toRemove = allready.filter(ingredient => atomised.filter(ingredient2 => _.isEqual(ingredient, ingredient2)).length === 0)
    if (toAdd.length !== 0) {
        const SQL = `
            INSERT INTO user_excluded_ingredients (userID, name, ingredientID) 
            VALUES ${toAdd.map(ingredient => `(${userID}, '${ingredient.name}', ${ingredient.ingredientID})`).join(',')}
        `
        execute(SQL)
    }
    if (toRemove.length !== 0) {
        toRemove.forEach(ing => {
            execute(`
                DELETE FROM user_excluded_ingredients
                WHERE userID = ? AND name = ? AND ingredientID = ?
            `, [userID, ing.name, ing.ingredientID])
        })
    }
    
    try {
        const newUser = getUserData(userID)
        res.json({"change": updates.changes ? "Yes" : "No", "user": newUser})
    } catch (err) {
        return res.status(400).json({ 'message': err.message })
    }   
}

const deleteUserController = (req, res) => {
    // validate input
    if (!req?.params?.userID) return res.status(400).json({ 'message': 'user/userID needed' })
    const { userID } = req.params

    const user = queryOne('SELECT * FROM user WHERE userID = ?', [userID])
    // Check if user exists
    if (!user) {
        return res.status(400).json({'message': `There is no user with userID ${userID}`})
    }

    const result = execute('DELETE FROM user WHERE userID = ?', [userID])

    res.json(result)
}

const addTagController = (req, res) => {
    if (!req?.body?.tagName) return res.status(400).json({ 'message': 'tagName needed' })
    if (!req?.params?.userID) return res.status(400).json({ 'message': 'userID needed' })
    const tagName = req.body.tagName
    const userID = req.params.userID

    const { lastInsertRowid } = execute('INSERT INTO user_tags (userID, name) VALUES (?, ?)', [userID, tagName])

    const tag = queryOne('SELECT * FROM user_tags WHERE tagID = ?', [lastInsertRowid])

    return res.json(tag)
}

const removeTagController = (req, res) => {
    if (!req?.body?.tagID) return res.status(400).json({ 'message': 'tagID needed' })
    if (!req?.params?.userID) return res.status(400).json({ 'message': 'userID needed' })
    const tagID = req.body.tagID
    const userID = Number(req.params.userID)

    const selectedTag = queryOne('SELECT userID FROM user_tags WHERE tagID = ?', [tagID])

    if (!selectedTag) {
        return res.status(400).json({'message': `There is no tag with tagID ${tagID}`})
    }

    if (selectedTag.userID !== userID) return res.status(403).json({'message': `this tag does not belong to user with userID ${userID}`})

    const result = execute('DELETE FROM user_tags WHERE tagID = ?', [tagID])

    res.json({removed: tagID})
}

const getUserCupboardItems = (req, res) => {
    if (!req?.params?.userID) return res.status(400).json({ 'message': 'user/cupboard/userID needed'})
    const userID = req.params.userID

    const cupboardItems = query("SELECT user_cupboard.name, GROUP_CONCAT(user_cupboard.ingredientID, ',') as ingredientIDs, GROUP_CONCAT(ingredient.name, ', ') as ingredientNames FROM user_cupboard JOIN ingredient ON user_cupboard.ingredientID = ingredient.ingredientID WHERE userID = ? GROUP BY user_cupboard.name", [userID])

    res.json(cupboardItems.map(ing => { return {
        ...ing, 
        'ingredientIDs': ing.ingredientIDs.split(',').map(n => Number(n)),
    }}))
}

const updateUserCupboardItems = (req, res) => {
    if (!req?.params?.userID) return res.status(400).json({ 'message': 'user/cupboard/userID needed'})
    if (!req?.body?.cupboard) return res.status(400).json({ 'message': 'cupboard needed' })
    const userID = req.params.userID
    const cupboard = req.body.cupboard

    const atomised = [].concat(...cupboard.map(ingredient => {
        const IDs = ingredient.ingredientIDs
        return IDs.map(id => {return { name: ingredient.name, ingredientID: id}} )
    }))

    const allready = query('SELECT name, ingredientID FROM user_cupboard WHERE userID = ?', [userID])

    const toAdd = atomised.filter(ingredient => allready.filter(ingredient2 => _.isEqual(ingredient, ingredient2)).length === 0)
    const toRemove = allready.filter(ingredient => atomised.filter(ingredient2 => _.isEqual(ingredient, ingredient2)).length === 0)
    if (toAdd.length !== 0) {
        const SQL = `
            INSERT INTO user_cupboard (userID, name, ingredientID) 
            VALUES ${toAdd.map(ingredient => `(${userID}, '${ingredient.name}', ${ingredient.ingredientID})`).join(',')}
        `
        execute(SQL)
    }
    if (toRemove.length !== 0) {
        toRemove.forEach(ing => {
            execute(`
                DELETE FROM user_cupboard
                WHERE userID = ? AND name = ? AND ingredientID = ?
            `, [userID, ing.name, ing.ingredientID])
        })
    }

    res.json({'message': 'ok'})
}

module.exports = {
    getUserDataController, 
    getAllUserDataController,
    updateUserDataController,
    deleteUserController,
    addTagController,
    removeTagController,
    getUserCupboardItems,
    updateUserCupboardItems
}