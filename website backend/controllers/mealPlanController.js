const { execute, queryOne, query } = require('./databaseController') 
const { checkValidity, incorrectValus } = require('../util/checkSQLOptionValidity')
const { formatMealPlan } = require('../util/formatMealPlan')
const { updateShoppingList } = require('../util/updateShoppingList')

const createMealPlanController = (req, res) => {
    if (!req?.params?.userID) return res.status(400).json({ 'message': 'userID needed' })
    const userID = req.params.userID
    var options = req.body.options
    // there may not be options
    if (!options || Object.keys(options).length === 0) {
        options = {}
    }
    options.userID = userID

    // check options
    if (!checkValidity(options, 'meal_plan')) {
        const [wrong, columns] = incorrectValus(options, 'meal_plan')
        return res.status(400).json({ 'Following Option Names are not valid:' : wrong, 'Possible Options:' : columns })
    }

    const currentActive = queryOne('SELECT * FROM meal_plan WHERE userID = ? AND active = 1', [userID])

    if (!currentActive) {
        options.active = 1
    }

    let optionsString = Object.keys(options).join(',')
    let values = Object.values(options)
    const QString = values.map(_ => '?').join(',')

    const changes = execute(`INSERT INTO meal_plan (${optionsString}) VALUES (${QString})`, [...values])
    if (!changes.changes) return res.status(500).json('Failed to create recipe')
    const meal_planID = changes.lastInsertRowid

    // Create the shopping list for the new meal plan
    updateShoppingList({meal_planID, userID})

    const meal_plan = queryOne('SELECT * FROM meal_plan WHERE meal_planID = ?', [meal_planID])

    res.json(meal_plan)
}

const deleteMealPlanController = (req, res) => {
    if (!req?.params?.userID) return res.status(400).json({ 'message': '/mealplan/meal_planID needed' })
    if (!req?.params?.meal_planID) return res.status(400).json({ 'message': '/mealplan/meal_planID needed' })
    const userID = Number(req.params.userID)
    const meal_planID = req.params.meal_planID

    const meal_plan = queryOne('SELECT * FROM meal_plan WHERE meal_planID = ?', [meal_planID])
    // Check if meal plan exists
    if (!meal_plan) {
        return res.status(400).json({'message': `There is no meal_plan with meal_planID ${meal_planID}`})
    }

    if (meal_plan.userID !== userID) {
        return res.status(403).json({'message': `This meal plan does not belong to user with userID ${userID}`})
    }

    if (meal_plan.active) {
        return res.status(403).json({'message': `Cannot delete active meal plan`})
    }

    const changes = execute('DELETE FROM meal_plan WHERE meal_planID = ?', [meal_planID])

    // Shopping list will be removed by cascade delete

    res.json(changes)
}

const getUserMealPlansController = (req, res) => {
    if (!req?.params?.userID) return res.status(400).json({ 'message': 'loggedInUserID needed' })
    const userID = req.params.userID
    const meal_plans = query('SELECT * FROM meal_plan WHERE userID = ?', [userID])
    const formatted = meal_plans.map(meal_plan => formatMealPlan(meal_plan))

    const combined = Object.assign({}, ...formatted)

    return res.json({'meal_plans': meal_plans, 'formatted': combined})
}

const getActiveUserMealPlanController = (req, res) => {
    if (!req?.params?.userID) return res.status(400).json({ 'message': 'loggedInUserID needed' })
    const userID = req.params.userID
    const active = queryOne('SELECT * FROM meal_plan WHERE userID = ? AND active = 1', [userID])
    
    if (!active) {
        return res.status(404).json({ 'message': 'No Active Meal Plan   ' })
    }

    const formatted = formatMealPlan(active)

    return res.json({'meal_plan': active, 'formatted': formatted})
}

const getMealPlanController = (req, res) => {
    if (!req?.params?.userID) return res.status(400).json({ 'message': '/mealplan/userID/meal_planID needed' })
    if (!req?.params?.meal_planID) return res.status(400).json({ 'message': '/mealplan/userID/meal_planID needed' })
    const meal_planID = req.params.meal_planID
    const userID = Number(req.params.userID)

    const meal_plan = queryOne('SELECT * FROM meal_plan WHERE meal_planID = ?', [meal_planID])

    if (!meal_plan) {
        return res.status(400).json({ 'message': `There is no meal plan with meal_planID : ${meal_planID}`})
    }

    if (meal_plan.userID !== userID) {
        return res.status(403).json({ 'message': `This meal_plan does not belong to user with userID : ${userID}`})
    }

    const formatted = formatMealPlan(meal_plan)

    res.json({'meal_plan': meal_plan, 'formatted': formatted[meal_planID]})
}

const updateMealPlanController = (req, res) => {
    if (!req?.body?.options) return res.status(400).json({ 'message': 'options needed' })
    if (!req?.params?.userID) return res.status(400).json({ 'message': '/mealplan/userID/meal_planID needed' })
    if (!req?.params?.meal_planID) return res.status(400).json({ 'message': '/mealplan/userID/meal_planID needed' })
    const options = req.body.options
    const meal_planID = req.params.meal_planID
    const userID = Number(req.params.userID)

    const owner = queryOne('SELECT userID FROM meal_plan WHERE meal_planID = ?', [meal_planID])

    if (!owner) {
        return res.status(400).json({ 'message': `There is no meal plan with meal_planID : ${meal_planID}`})
    }

    if (owner.userID !== userID) {
        return res.status(403).json({ 'message': `This meal_plan does not belong to user with userID : ${userID}`})
    }

    if (Object.keys(options).length === 0) {
        return res.status(400).json({ 'message': `No options provided`})
    }

    // check options
    if (!checkValidity(options, 'meal_plan')) {
        const [wrong, columns] = incorrectValus(options, 'meal_plan')
        return res.status(400).json({ 'Following Option Names are not valid:' : wrong, 'Possible Options:' : columns })
    }

    const optionsString = Object.keys(options).map(key => `${key}=${typeof(options[key]) == 'string' ? `'${options[key].replaceAll('\'', '\'\'')}'`: options[key]}`).join(", ");

    const updates = execute(`UPDATE meal_plan SET ${optionsString} WHERE meal_planID = ?`, [meal_planID])

    // Create the shopping list for the new meal plan
    updateShoppingList({meal_planID, userID})

    const newMealPlan = queryOne('SELECT * FROM meal_plan WHERE meal_planID = ?', [meal_planID])
    res.json({"change": updates.changes ? "Yes" : "No", "meal_plan": newMealPlan})
}

const setActiveMealPlanController = (req, res) => {
    if (!req?.params?.userID) return res.status(400).json({ 'message': '/mealplan/userID/meal_planID needed' })
    if (!req?.body?.meal_planID) return res.status(400).json({ 'message': 'meal_planID needed' })
    const userID = Number(req.params.userID)
    const meal_planID = req.body.meal_planID

    const meal_plan = queryOne('SELECT * FROM meal_plan WHERE meal_planID = ?', [meal_planID])

    if (!meal_plan) {
        return res.status(400).json({ 'message': `There is no meal plan with meal_planID : ${meal_planID}`})
    }

    if (meal_plan.userID !== userID) {
        return res.status(403).json({ 'message': `This meal_plan does not belong to user with userID : ${userID}`})
    }

    const changes = execute('UPDATE meal_plan SET active = 0 WHERE userID = ?', [userID])

    const active = execute('UPDATE meal_plan SET active = 1 WHERE meal_planID = ?', [meal_planID])

    res.json({'message': 'ok'})
}


// Shopping list routes also here
const getShoppingListController = (req, res) => {
    if (!req?.params?.userID) return res.status(400).json({ 'message': '/mealplan/userID/meal_planID/shoppinglist needed' })
    if (!req?.params?.meal_planID) return res.status(400).json({ 'message': '/mealplan/userID/meal_planID/shoppinglist needed' })
    const userID = Number(req.params.userID)
    const meal_planID = req.params.meal_planID

    const SQL = `
    SELECT recipe.recipeID, recipe.title, GROUP_CONCAT(shopping_list_itemID) AS itemIDs, GROUP_CONCAT(ingredient_name, ';!;') AS ingredient_names, count, GROUP_CONCAT(checked) AS checked_values FROM meal_plan_shopping_list
    JOIN meal_plan ON meal_plan.meal_planID = meal_plan_shopping_list.meal_planID
    JOIN recipe ON recipe.recipeID = meal_plan_shopping_list.recipeID
    WHERE meal_plan.userID = ?
    AND meal_plan.meal_planID = ?
    GROUP BY recipe.title
    `
    
    const shoppingList = query(SQL, [userID, meal_planID])

    const formattedShoppingList = shoppingList.map(recipe => {
        const ingredients = recipe['ingredient_names'].split(';!;')
        const checked = recipe['checked_values'].split(',')
        const itemIDs = recipe['itemIDs'].split(',')
        const newIngredients = ingredients.map((ingredient, index) => {
            return {
                itemID: Number(itemIDs[index]),
                checked: Number(checked[index]),
                ingredient
            }
        })
        return {
            recipeID: recipe.recipeID,
            title: recipe.title,
            ingredients: newIngredients,
            count: recipe.count
        }
    })

    res.json(formattedShoppingList)
}

const checkShoppingListItemsController = (req, res) => {
    if (!req?.params?.userID) return res.status(400).json({ 'message': '/mealplan/userID/meal_planID/shoppinglist needed' })
    if (!req?.params?.meal_planID) return res.status(400).json({ 'message': '/mealplan/userID/meal_planID/shoppinglist needed' })
    if (!req?.body?.checkedIDs) return res.status(400).json({ 'message': 'checkedIDs needed' })
    const userID = Number(req.params.userID)
    const meal_planID = req.params.meal_planID
    const checkedIDs = req.body.checkedIDs

    // check if meal plan exists
    const meal_plan = queryOne('SELECT * FROM meal_plan WHERE meal_planID = ?', [meal_planID])
    if (!meal_plan) {
        return res.status(400).json({ 'message': `There is no meal plan with meal_planID : ${meal_planID}`})
    }
    // check it is the correct user
    if (meal_plan.userID !== userID) {
        return res.status(403).json({ 'message': `This meal_plan does not belong to user with userID : ${userID}`})
    }    

    // set checked to 1 for all items in checkedIDs
    const SQL = `
    UPDATE meal_plan_shopping_list
    SET checked = 1
    WHERE meal_planID = ?
    AND shopping_list_itemID IN (${checkedIDs})
    `

    execute(SQL, [meal_planID])

    // set checked to 0 for all items not in checkedIDs
    const SQL2 = `
    UPDATE meal_plan_shopping_list
    SET checked = 0
    WHERE meal_planID = ?
    AND shopping_list_itemID NOT IN (${checkedIDs})
    `
    execute(SQL2, [meal_planID])

    res.json({'message': 'ok'})
}


module.exports = {
    createMealPlanController,
    deleteMealPlanController,
    getUserMealPlansController,
    getMealPlanController,
    updateMealPlanController,
    getActiveUserMealPlanController,
    setActiveMealPlanController,
    getShoppingListController,
    checkShoppingListItemsController
} 