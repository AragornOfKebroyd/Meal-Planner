const { query, queryOne, execute } = require('../controllers/databaseController')
const JSON5 = require('json5')

const updateShoppingList = ({meal_planID, userID}) => {
    const mealPlan = queryOne('SELECT * FROM meal_plan where meal_planID = ? AND userID = ?', [meal_planID, userID])
    delete mealPlan.meal_planID
    delete mealPlan.userID
    delete mealPlan.name
    delete mealPlan.active
    
    const recipeIDs = Object.values(mealPlan).filter(v => v !== null).map(Number)
    
    const SQL = `
    SELECT recipeID, title, ingredient_groups
    FROM recipe
    WHERE recipeID IN (${recipeIDs})
    `
    const results = query(SQL)

    // add counts as there may be multiple of the same recipe in the meal plan
    const counts = {}
    recipeIDs.forEach(id => {
        counts[id] = (counts[id] || 0) + 1
    })

    const withCounts = results.map(result => {
        const ingredients = JSON5.parse(result.ingredient_groups.replaceAll(': None', ': null'))
        var flattened = []
        ingredients.forEach(ingredient_group => {
            flattened = flattened.concat(Object.values(ingredient_group.ingredients))
        })
        return {recipeID: result.recipeID, title: result.title, count: counts[result.recipeID], ingredients: flattened}
    })

    withCounts.forEach(recipe => {
        const currentIngredients = query('SELECT ingredient_name, count FROM meal_plan_shopping_list WHERE recipeID = ? AND meal_planID = ?', [recipe.recipeID, meal_planID])
        let values = []
        recipe.ingredients.forEach(ing => {
            const ingredient_name = ing.replaceAll('\'', '\'\'')

            // Only add if it is not allready there so the checked state does not get reset
            if (!currentIngredients.map(v => v.ingredient_name).includes(ingredient_name)) {
                values.push(`(${meal_planID}, ${recipe.recipeID}, '${ingredient_name}', ${recipe.count})`)
            }
            // if just count is changed, update it
            else {
                const count = recipe.count
                execute(`UPDATE meal_plan_shopping_list SET count = ${count} WHERE recipeID = ${recipe.recipeID} AND meal_planID = ${meal_planID} AND ingredient_name = '${ingredient_name}'`)
            }
        })
        // if there are changes to be made, make them
        if (values.length) {
            execute(`INSERT INTO meal_plan_shopping_list (meal_planID, recipeID, ingredient_name, count) VALUES ${values}`)
        }
    })

    return withCounts
}

module.exports = { updateShoppingList }