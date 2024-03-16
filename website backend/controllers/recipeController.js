const { execute, queryOne, query } = require('./databaseController') 
const { getUserRatedRecipes } = require('../util/recipeSuggestions')
const { checkValidity, incorrectValus } = require('../util/checkSQLOptionValidity')

const getRecipeController = (req, res) => {
    if (!req?.params?.recipeID) return res.status(400).json({ 'message': 'reicpe/recipeID/userID needed' })
    if (!req?.params?.userID) return res.status(400).json({ 'message': 'reicpe/recipeID/userID needed' })

    const recipeID = Number(req.params.recipeID) // add validation that is is actually a number TODO
    const userID = Number(req.params.userID)

    const recipe = queryOne('SELECT * FROM recipe WHERE recipeID = ?', [recipeID])
    if (!recipe) {
        return res.status(400).json({ 'message': `No recipe with recipeID ${recipeID} exists.` })
    }

    var SQL = `
    SELECT ingredient.ingredientID, ingredient.name 
    FROM recipeIngredient
    JOIN ingredient ON ingredient.ingredientID = recipeIngredient.ingredientID
    WHERE recipeIngredient.recipeID = ?
    `
    

    const ingredients = query(SQL, [recipeID])

    SQL = `
    SELECT cuisine.cuisineID, cuisine.name
    FROM recipeCuisine
    JOIN cuisine ON cuisine.cuisineID = recipeCuisine.cuisineID
    WHERE recipeCuisine.recipeID = ?
    `
    
    const cuisines = query(SQL, [recipeID])
    SQL = `
    SELECT category.categoryID, category.name 
    FROM recipeCategory
    JOIN category ON category.categoryID = recipeCategory.categoryID
    WHERE recipeCategory.recipeID = ?
    `
    const categories = query(SQL, [recipeID])

    SQL = `
    SELECT user_tags.tagID, user_tags.name, user_tags.userID FROM user_saved_recipesTags 
    JOIN user_tags ON user_tags.tagID = user_saved_recipesTags.tagID 
    JOIN user_saved_recipes ON user_saved_recipes.saved_recipeID = user_saved_recipesTags.saved_recipeID 
    WHERE recipeID = ?
    AND user_tags.userID = ?
    `
    const tags = query(SQL, [recipeID, userID])

    const saved = queryOne('SELECT * FROM user_saved_recipes WHERE recipeID = ? AND userID = ?', [recipeID, userID])

    const recipeIsSaved = saved ? true : false

    res.json({recipe, ingredients, cuisines, categories, tags, saved, recipeIsSaved})
}

const devDeleteRecipe = (req, res) => {
    if (!req?.params?.recipeID) {
        return res.status(400).json({ 'message': 'reicpe/recipeID needed' })
    }
    const { recipeID } = req.params

    const change = execute('DELETE FROM recipe WHERE recipeID = ?', [recipeID])

    return res.json(change)
}

const searchRecipesController = (req, res) => {
    if (!req?.body?.amount && req?.body?.countOnly !== true) return res.status(400).json({ 'message': 'amount or countOnly:true needed' })
    const {recipeOptions, ingredientOptions, categoryOptions, cuisineOptions, amount, offset, sortBy} = req.body
    if (recipeOptions){
        if (Object.keys(recipeOptions).length === 0) {
            var optionsString = 'WHERE recipe.user_recipe = 0'
        } else {
            if (!checkValidity(recipeOptions, 'recipe')) {
                const [wrong, columns] = incorrectValus(recipeOptions, 'recipe')
                return res.status(400).json({ 'Following Option Names are not valid:' : wrong, 'Possible Options:' : columns })
            }
            var optionsString = 'WHERE ' + [...Object.keys(recipeOptions)
                .map(key => 
                    Array.isArray(recipeOptions[key]) && recipeOptions[key][0] ==='SQL'
                    ? `${recipeOptions[key][1]}`
                    : key==='title' 
                        ? `recipe.title LIKE '%${recipeOptions.title}%'` 
                        : `(recipe.${key} ${recipeOptions[key][0]} ${recipeOptions[key][1]} ${recipeOptions[key][0] === '>=' && recipeOptions[key][1] === '0' ? ` OR recipe.${key} IS NULL` : ''})`), 'recipe.user_recipe = 0'].join(' AND ')
        }
    } else {
        var optionsString = 'WHERE recipe.user_recipe = 0'
    }

    if (ingredientOptions) {
        if (Object.keys(ingredientOptions).length === 0) {
            var ingredientString = null
        } else {
            var ingIDs = Object.entries(ingredientOptions).filter(([k,v]) => v == 1).map(([k,v]) => Number(k))
            var notIngIDs = Object.entries(ingredientOptions).filter(([k,v]) => v == 0).map(([k,v]) => Number(k))
            if (ingIDs.length == 0 && notIngIDs.length != 0) {
                var ingredientString = `
                SELECT DISTINCT recipe.recipeID FROM recipe
                WHERE recipe.recipeID NOT IN (
                    SELECT DISTINCT recipeIngredient.recipeID 
                    FROM recipeIngredient
                    WHERE recipeIngredient.ingredientID IN (${notIngIDs.join(',')})
                )`
            } else if (ingIDs.length != 0 && notIngIDs.length == 0) {
                var ingredientString = `
                SELECT recipeID FROM recipeIngredient
                JOIN ingredient ON ingredient.ingredientID = recipeIngredient.ingredientID
                WHERE ingredient.ingredientID IN (${ingIDs.join(',')})
                GROUP by recipeIngredient.recipeID
                HAVING COUNT(ingredient.ingredientID) = ${ingIDs.length}`
            } else if (ingIDs.length != 0 && notIngIDs.length != 0) {
                var ingredientString = `
                SELECT recipeID FROM recipeIngredient
                JOIN ingredient ON ingredient.ingredientID = recipeIngredient.ingredientID
                WHERE recipeIngredient.recipeID NOT IN (
                    SELECT DISTINCT recipeIngredient.recipeID FROM recipeIngredient
                    WHERE recipeIngredient.ingredientID IN (${notIngIDs.join(',')})
                )
                AND ingredient.ingredientID IN (${ingIDs.join(',')})
                GROUP by recipeIngredient.recipeID
                HAVING COUNT(ingredient.ingredientID) = ${ingIDs.length}`
            }
        }
    } else {
        var ingredientString = null
    }

    if (categoryOptions) {
        if (Object.keys(categoryOptions).length === 0) {
            var categoryString = null
        } else {
            var catIDs = Object.entries(categoryOptions).filter(([k,v]) => v == 1).map(([k,v]) => Number(k))
            var notCatIDs = Object.entries(categoryOptions).filter(([k,v]) => v == 0).map(([k,v]) => Number(k))
            if (catIDs.length == 0 && notCatIDs.length != 0) {
                var categoryString = `
                SELECT DISTINCT recipe.recipeID FROM recipe
                WHERE recipe.recipeID NOT IN (
                    SELECT DISTINCT recipeCategory.recipeID FROM recipeCategory
                    WHERE recipeCategory.categoryID IN (${notCatIDs.join(',')})
                )`
            } else if (catIDs.length != 0 && notCatIDs.length == 0) {
                var categoryString = `
                SELECT recipeID FROM recipeCategory
                JOIN category ON category.categoryID = recipeCategory.categoryID
                WHERE category.categoryID IN (${catIDs.join(',')})
                GROUP by recipeCategory.recipeID
                HAVING COUNT(category.categoryID) = ${catIDs.length}`
            } else if (catIDs.length != 0 && notCatIDs.length != 0) {
                var categoryString = `
                SELECT recipeID FROM recipeCategory
                JOIN category ON category.categoryID = recipeCategory.categoryID
                WHERE recipeCategory.recipeID NOT IN (
                    SELECT DISTINCT recipeCategory.recipeID FROM recipeCategory
                    WHERE recipeCategory.categoryID IN (${notCatIDs.join(',')})
                )
                AND category.categoryID IN (${catIDs.join(',')})
                GROUP by recipeCategory.recipeID
                HAVING COUNT(category.categoryID) = ${catIDs.length}`
            }
        }


    } else {
        var categoryString = null
    }

    if (cuisineOptions) {
        if (Object.keys(cuisineOptions).length === 0) {
            var cuisineString = null
        } else {

            var cusIDs = Object.entries(cuisineOptions).filter(([k,v]) => v == 1).map(([k,v]) => Number(k))
            var notCusIDs = Object.entries(cuisineOptions).filter(([k,v]) => v == 0).map(([k,v]) => Number(k))
            if (cusIDs.length == 0 && notCusIDs.length != 0) {
                var cuisineString = `
                SELECT recipe.recipeID FROM recipe
                WHERE recipe.recipeID NOT IN (
                    SELECT DISTINCT recipeCuisine.recipeID FROM recipeCuisine
                    WHERE recipeCuisine.cuisineID IN (${notCusIDs.join(',')})
                )`
            } else if (cusIDs.length != 0 && notCusIDs.length == 0) {
                var cuisineString = `
                SELECT recipeID FROM recipeCuisine
                JOIN cuisine ON cuisine.cuisineID = recipeCuisine.cuisineID
                WHERE cuisine.cuisineID IN (${cusIDs.join(',')})
                GROUP by recipeCuisine.recipeID
                HAVING COUNT(cuisine.cuisineID) = ${cusIDs.length}`
            } else if (cusIDs.length != 0 && notCusIDs.length != 0) {
                var cuisineString = `
                SELECT recipeID FROM recipeCuisine
                JOIN cuisine ON cuisine.cuisineID = recipeCuisine.cuisineID
                WHERE recipeCuisine.recipeID NOT IN (
                    SELECT DISTINCT recipeCuisine.recipeID FROM recipeCuisine
                    WHERE recipeCuisine.cuisineID IN (${notCusIDs.join(',')})
                ) 
                AND cuisine.cuisineID IN (${cusIDs.join(',')})
                GROUP by recipeCuisine.recipeID
                HAVING COUNT(cuisine.cuisineID) = ${cusIDs.length}`
            }
        }
    } else {
        var cuisineString = null
    }

    const interestString = [ingredientString, cuisineString, categoryString].filter(a => a !== null).join(`
    INTERSECT
    `)

    const countSQL = `
    SELECT (
        SELECT COUNT(*)
        ${interestString 
            ? `FROM (${interestString}) AS filtered JOIN recipe ON filtered.recipeID = recipe.recipeID` 
            : 'FROM recipe'}
        ${optionsString}
        ${sortBy 
            ? `${optionsString ? 'AND' : 'WHERE'} ${sortBy.split(' ')[0]} NOT NULL
            ORDER BY ${sortBy}` 
            : ''}
    ) * 100.0 / (
        SELECT COUNT(*) FROM recipe
    ) AS percentage, (
        SELECT COUNT(*)
        ${interestString 
            ? `FROM (${interestString}) AS filtered JOIN recipe ON filtered.recipeID = recipe.recipeID` 
            : 'FROM recipe'}
        ${optionsString}
        ${sortBy 
            ? `${optionsString ? 'AND' : 'WHERE'} ${sortBy.split(' ')[0]} NOT NULL
            ORDER BY ${sortBy}` 
            : ''}
    ) AS total`
    const count = queryOne(countSQL)
    const countOnly = req?.body?.countOnly ? true : false
    if (countOnly) return res.json(count)
    
    const SQL = `
    SELECT *
    ${interestString 
        ? `FROM (${interestString}) AS filtered JOIN recipe ON filtered.recipeID = recipe.recipeID` 
        : 'FROM recipe'}
    ${optionsString}
    ${sortBy 
        ? `${optionsString ? 'AND' : 'WHERE'} ${sortBy.split(' ')[0]} NOT NULL
        ORDER BY ${sortBy}` 
        : ''}
    LIMIT ${amount}
    ${offset ? `OFFSET ${offset}` : ''}`
    
    console.log(SQL)
    const rows = query(SQL)

    res.json({ recipes: rows, count: count })
    
}

const getSuggestedRecipesController = (req, res) => {
    if (!req?.body?.loggedInUserID) return res.status(400).json({ 'message': 'loggedInUserID needed' })
    const loggedInUserID = req.body.loggedInUserID
    rated_recipeIDS = getUserRatedRecipes(loggedInUserID)

    // I will come back to this if there is time

    res.json('WIP')
}

const getRecipesFromIngredientsController = (req, res) => {
    if (!req?.body?.ingredientIDs) return res.status(400).json({ 'message': 'ingreidientIDs needed' })
    if (!req?.body?.amount) return res.status(400).json({ 'message': 'amount needed' })
    if (req?.body?.offset !== 0 && !req?.body?.offset) return res.status(400).json({ 'message': 'offset needed' })
    const {ingredientIDs, amount, offset, sortBy} = req.body

    // check is array
    if (!Array.isArray(ingredientIDs)) {
        return res.status(400).json({ 'message': 'ingreidientIDs should be a list' })
    }
    // check not empty
    if (ingredientIDs.length === 0) {
        return res.status(400).json({ 'message': 'ingreidientIDs should not be empty' })
    }

    const ingredientArray = '(' + ingredientIDs.join(',') + ')'

    const SQL = `
    SELECT *, GROUP_CONCAT(ingredient.name) AS IDs
	FROM recipe
	LEFT JOIN recipeIngredient ON (recipe.recipeID = recipeIngredient.recipeID)
    JOIN ingredient ON recipeIngredient.ingredientID = ingredient.ingredientID
	WHERE recipeIngredient.ingredientID IN ${ingredientArray}
    ${sortBy ? `AND ${sortBy.split(' ')[0]} NOT NULL` : ''}
	GROUP BY recipe.recipeID
	ORDER BY count(*) DESC ${sortBy ? `, ${sortBy}` : ''}
	LIMIT ?
    OFFSET ?
    `
    const results = query(SQL, [amount, offset])
    // doesnt take into account preferences [TODO]

    res.json(results)
}

const getIngredientsController = (req, res) => {
    const limit = req.body.limit || -1
    const search = req.body.search

    let results
    if (search) {
        results = query(`SELECT * FROM ingredient WHERE name LIKE '%${search}%' LIMIT ?`, [limit])
    } else {
        results = query('SELECT * FROM ingredient LIMIT ?', [limit])
    }
    res.json(results)
}

const getWesbitesController = (req, res) => {
    const limit = req.body.limit || -1
    const search = req.body.search

    let results
    if (search) {
        results = query(`SELECT DISTINCT website FROM recipe WHERE name LIKE '%${search}%' LIMIT ?`, [limit])
    } else {
        results = query('SELECT DISTINCT website FROM recipe WHERE website NOT NULL LIMIT ?', [limit])
    }
    res.json(results)
}

const getCuisinesController = (req, res) => {
    const limit = req.body.limit || -1
    const search = req.body.search

    let results
    if (search) {
        results = query(`SELECT * FROM cuisine WHERE name LIKE '%${search}%' LIMIT ?`, [limit])
    } else {
        results = query('SELECT * FROM cuisine LIMIT ?', [limit])
    }
    res.json(results)
}

const getCategoriesController = (req, res) => {
    const limit = req.body.limit || -1
    const search = req.body.search

    let results
    if (search) {
        results = query(`SELECT * FROM category WHERE name LIKE '%${search}%' LIMIT ?`, [limit])
    } else {
        results = query('SELECT * FROM category LIMIT ?', [limit])
    }
    res.json(results)
}

module.exports = {
    getRecipeController,
    devDeleteRecipe,
    searchRecipesController,
    getSuggestedRecipesController,
    getRecipesFromIngredientsController,
    getIngredientsController,
    getWesbitesController,
    getCuisinesController,
    getCategoriesController
}