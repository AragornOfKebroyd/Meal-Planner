const { query } = require('../controllers/databaseController')

const getUserRatedRecipes = (userID) => {
    const recipes = query('SELECT recipeID FROM user_saved_recipes WHERE userID = ? AND rating NOT NULL', [userID])
    console.log(recipes)
    return recipes
}

module.exports = { getUserRatedRecipes }