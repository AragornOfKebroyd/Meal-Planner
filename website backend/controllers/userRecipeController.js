const { query, queryOne, execute } = require('./databaseController')
const { checkValidity, incorrectValus } = require('../util/checkSQLOptionValidity')

const updateUserRecipeController = (req, res) => {
    // same as get recipe controller
    if (!req?.params?.userID) return res.status(400).json({ 'message': 'recipe/userID/created needed' })
    if (!req?.body?.recipeID) return res.status(400).json({ 'message': 'recipeID needed' })
    if (!req?.body?.options) return res.status(400).json({ 'message': 'options needed' })
    const userID = Number(req.params.userID)
    const recipeID = req.body.recipeID
    const options = req.body.options
    
    const recipe = queryOne('SELECT * FROM recipe WHERE recipeID = ?', [recipeID])
    if (!recipe) {
        return res.status(400).json({ 'message': `No recipe with recipeID ${recipeID} exists.` })
    }

    // then check if user recipe
    if (!recipe.user_recipe) {
        return res.status(403).json({ 'message': `Cannot Update an App recipe, must be a user recipe` })
    }

    // check it is the correct user
    const toBeUpdated = queryOne('SELECT userID FROM user_saved_recipes WHERE recipeID = ?', [recipeID])
    if (toBeUpdated.userID !== userID) {
        return res.status(403).json({ 'message': `This recipe does not belong to user with userID : ${userID}`})
    }

    // do the update
    if (Object.keys(options).length === 0) {
        return res.status(400).json('No options provided')
    }
    const optionsString = Object.keys(options).map(key => `${key}=${typeof(options[key]) == 'string' ? `'${options[key].replaceAll('\'', '\'\'')}'`: options[key]}`).join(", ");
    
    // check the options
    if (!checkValidity(options, 'recipe')) {
        const [wrong, columns] = incorrectValus(options, 'recipe')
        return res.status(400).json({ 'Following Option Names are not valid:' : wrong, 'Possible Options:' : columns })
    }

    const updates = execute(`UPDATE recipe SET ${optionsString} WHERE recipeID = ?`, [recipeID])
    const newRecipe = queryOne('SELECT * FROM recipe WHERE recipeID = ?', [recipeID])
    res.json({"change": updates.changes ? "Yes" : "No", "user": newRecipe})
}

const addUserRecipeController = (req, res) => {
    if (!req?.params?.userID) return res.status(400).json({ 'message': 'userID needed' })
    if (!req?.body?.options) return res.status(400).json({ 'message': 'options needed' })
    const userID = Number(req.params.userID)
    const options = req.body.options

    if (Object.keys(options).length === 0) return res.status(400).json('No options provided')
    
    options['user_recipe'] = 1

    // check options
    if (!checkValidity(options, 'recipe')) {
        const [wrong, columns] = incorrectValus(options, 'recipe')
        return res.status(400).json({ 'Following Option Names are not valid:' : wrong, 'Possible Options:' : columns })
    }

    let optionsString = Object.keys(options).join(',')
    let values = Object.values(options)
    const QString = values.map(_ => '?').join(',')

    const changes = execute(`INSERT INTO recipe (${optionsString}) VALUES (${QString})`, [...values])
    if (!changes.changes) return res.status(500).json('Failed to create recipe')
    const recipeID = changes.lastInsertRowid

    execute('INSERT INTO user_saved_recipes (recipeID, userID) VALUES (?, ?)', [recipeID, userID])

    const newRecipe = queryOne('SELECT * FROM recipe WHERE recipeID = ?', [recipeID])
    const savedRecipe = queryOne('SELECT * FROM user_saved_recipes WHERE recipeID = ? AND userID = ?', [recipeID, userID])
    return res.json({'recipe': newRecipe, 'saved': savedRecipe})
}

const getUserRecipesController = (req, res) => {
    if (!req?.params?.userID) return res.status(400).json({ 'message': 'userID needed' })
    const userID = req.params.userID
    const recipes = query('SELECT * FROM user_saved_recipes JOIN recipe ON user_saved_recipes.recipeID = recipe.recipeID WHERE user_saved_recipes.userID = ? AND recipe.user_recipe = 1', [userID])
    
    return res.json(recipes)
}

const deleteUserRecipeController = (req, res) => {
    if (!req?.params?.userID) return res.status(400).json({ 'message': 'userID needed' })
    if (!req?.body?.recipeID) return res.status(400).json({ 'message': 'recipeID needed' })
    const userID = Number(req.params.userID)
    const recipeID = req.body.recipeID

    const recipe = queryOne('SELECT * FROM recipe WHERE recipeID = ?', [recipeID])
    if (!recipe) {
        return res.status(400).json({ 'message': `No recipe with recipeID ${recipeID} exists.` })
    }

    // then check if user recipe
    if (!recipe.user_recipe) {
        return res.status(403).json({ 'message': `Cannot Delete an App recipe, must be a user recipe` })
    }

    // check it is the correct user
    const toBeDeleted = queryOne('SELECT userID FROM user_saved_recipes WHERE recipeID = ?', [recipeID])
    if (toBeDeleted.userID !== userID) {
        return res.status(403).json({ 'message': `This recipe does not belong to user with userID : ${userID}`})
    }

    // do the delete
    execute('DELETE FROM user_saved_recipes WHERE recipeID = ?', [recipeID])
    execute('DELETE FROM recipe WHERE recipeID = ?', [recipeID])
    return res.json('ok')
}

const getUserSavedRecipesController = (req, res) => {
    if (!req?.params?.userID) return res.status(400).json({ 'message': 'userID needed' })
    if (!req?.params?.IDsOnly) return res.status(400).json({ 'message': 'IDsOnly needed' })
    const userID = req.params.userID
    const IDsOnly = req.params.IDsOnly
    var SQL
    if (IDsOnly === '1') {
        SQL = `
        SELECT user_saved_recipes.recipeID
        FROM user_saved_recipes
        JOIN recipe ON user_saved_recipes.recipeID = recipe.recipeID
        WHERE user_saved_recipes.userID = ?
        `
    } else {
        SQL = `
        SELECT user_saved_recipes.*, recipe.*, GROUP_CONCAT(tagID) AS tagIDs FROM user_saved_recipes
        JOIN recipe ON user_saved_recipes.recipeID = recipe.recipeID
        LEFT JOIN user_saved_recipesTags ON  user_saved_recipes.saved_recipeID = user_saved_recipesTags.saved_recipeID
        WHERE user_saved_recipes.userID = ?
        GROUP BY user_saved_recipes.recipeID;
        ` // recipe.user_recipe = 0 means it is not a user recipe
    }
    const recipes = query(SQL, [userID])

    return res.json(recipes)
}

const createRecipeCopyController = (req, res) => {
    if (!req?.body?.userID) return res.status(400).json({ 'message': 'userID needed' })
    if (!req?.params?.recipeID) return res.status(400).json({ 'message': 'recipe/recipeID/copy needed' })
    const userID = req.body.userID
    const recipeID = req.params.recipeID

    const recipeBase = queryOne('SELECT * FROM recipe WHERE recipeID = ?', [recipeID])
    const alteredRecipe = {...recipeBase, 'user_recipe': 1}
    delete alteredRecipe.recipeID
    
    let optionsString = Object.keys(alteredRecipe).join(',')
    let values = Object.values(alteredRecipe)
    const QString = values.map(_ => '?').join(',')

    const changes = execute(`INSERT INTO recipe (${optionsString}) VALUES (${QString})`, [...values])
    if (!changes.changes) return res.status(500).json('Failed to create recipe')
    const newRecipeID = changes.lastInsertRowid

    execute('INSERT INTO user_saved_recipes (recipeID, userID) VALUES (?, ?)', [newRecipeID, userID])

    const newRecipe = queryOne('SELECT * FROM recipe WHERE recipeID = ?', [newRecipeID])
    const savedRecipe = queryOne('SELECT * FROM user_saved_recipes WHERE recipeID = ? AND userID = ?', [newRecipeID, userID])
    return res.json({'new Recipe': newRecipe, 'saved Recipe': savedRecipe})
}

const saveRecipeController = (req, res) => { // not in plan!!!
    if (!req?.params?.userID) return res.status(400).json({ 'message': 'recipe/userID/saved needed' })
    if (!req?.body?.recipeID) return res.status(400).json({ 'message': 'recipeID needed' })
    const userID = req.params.userID
    const recipeID = req.body.recipeID
    
    execute('INSERT INTO user_saved_recipes (recipeID, userID) VALUES (?, ?)', [recipeID, userID])
    const savedRecipe = queryOne('SELECT * FROM user_saved_recipes WHERE recipeID = ? AND userID = ?', [recipeID, userID])
    return res.json({'savedRecipe': savedRecipe})
}

const unsaveRecipeController = (req, res) => {
    if (!req?.params?.userID) return res.status(400).json({ 'message': 'recipe/userID/saved needed' })
    if (!req?.body?.recipeID) return res.status(400).json({ 'message': 'recipeID needed' })
    const userID = req.params.userID
    const recipeID = req.body.recipeID
    
    const savedRecipe = queryOne('SELECT * FROM user_saved_recipes WHERE recipeID = ? AND userID = ?', [recipeID, userID])
    if (!savedRecipe) {
        return res.status(400).json({ 'message': `No saved recipe with recipeID ${recipeID} belonging to user ${userID} found.` })
    }

    // NOTE: the tags for a saved recipe will stay even if you unsave a recipe, this is so if they resave it at any point their tags will be returned

    execute('DELETE FROM user_saved_recipes WHERE recipeID = ? AND userID = ?', [recipeID, userID])
    return res.json('ok')
}

const updateSavedRecipeController = (req, res) => { // not in plan!!!
    if (!req?.params?.userID) return res.status(400).json({ 'message': 'recipe/userID/saved needed' })
    if (!req?.body?.recipeID) return res.status(400).json({ 'message': 'recipeID needed' })
    if (!req?.body?.options) return res.status(400).json({ 'message': 'options needed' })
    
    const loggedInUserID = req.params.userID
    const { recipeID, options } = req.body

    if (Object.keys(options).length === 0) return res.status(400).json('No options provided')

    // check options
    if (!checkValidity(options, 'user_saved_recipes')) {
        const [wrong, columns] = incorrectValus(options, 'user_saved_recipes')
        return res.status(400).json({ 'Following Option Names are not valid:' : wrong, 'Possible Options:' : columns })
    }

    const optionsString = Object.keys(options).map(key => `${key}=${typeof(options[key]) == 'string' ? `'${options[key].replaceAll('\'', '\'\'')}'`: options[key]}`).join(", ");
    
    const updates = execute(`UPDATE user_saved_recipes SET ${optionsString} WHERE recipeID = ? AND userID = ?`, [recipeID, loggedInUserID])
    const newRecipe = queryOne('SELECT * FROM user_saved_recipes WHERE recipeID = ? AND userID = ?', [recipeID, loggedInUserID])
    res.json({"change": updates.changes ? "Yes" : "No", "user": newRecipe})
}

const setRecipeTagsController = (req, res) => { // not in plan
    if (!req?.params?.recipeID) return res.status(400).json({ 'message': 'recipeID needed' })
    if (!req?.body?.userID) return res.status(400).json({ 'message': 'userID needed' })
    if (!req?.body?.tagIDs) return res.status(400).json({ 'message': 'tagIDs needed' })

    const userID = req.body.userID
    const recipeID = req.params.recipeID
    const tagIDs = req.body.tagIDs

    if (!Array.isArray(tagIDs)) return res.status(400).json({ 'message': 'tagIDs must be an array' })

    const savedRecipe = queryOne('SELECT saved_recipeID FROM user_saved_recipes WHERE recipeID = ? AND userID = ?', [recipeID, userID])

    if (!savedRecipe) {
        return res.status(400).json({ 'message': `No saved recipe with recipeID ${recipeID} belonging to user ${userID} found.` })
    }

    tagIDs.forEach(tagID => {
        const tag = queryOne('SELECT * FROM user_tags WHERE tagID = ? AND userID = ?', [tagID, userID])
        if (!tag) {
            return res.status(400).json({ 'message': `No tag with tagID ${tagID} belonging to user ${userID} found.` })
        }
    })

    execute('DELETE FROM user_saved_recipesTags WHERE saved_recipeID = ?', [savedRecipe.saved_recipeID])

    tagIDs.forEach(tagID => {
        execute('INSERT INTO user_saved_recipesTags (saved_recipeID, tagID) VALUES (?, ?)', [savedRecipe.saved_recipeID, tagID])
    })

    res.json({ 'message': 'ok' })
}

module.exports = {
    addUserRecipeController,
    updateUserRecipeController,
    getUserRecipesController,
    getUserSavedRecipesController,
    createRecipeCopyController,
    deleteUserRecipeController,
    saveRecipeController,
    updateSavedRecipeController,
    unsaveRecipeController,
    setRecipeTagsController
}