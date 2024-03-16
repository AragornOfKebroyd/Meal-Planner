const { query, execute } = require('../controllers/databaseController')
const { hashPassword } = require('../util/password')
const { updateShoppingList } = require('../util/updateShoppingList')

const testingFunction = (req, res) => {
    const newPassword = hashPassword('1234')
    execute('UPDATE user SET password_hash = ? WHERE username = ?', [newPassword, 'Aragorn'])
    res.json({'msg': 'ok'})
}
const rows = (req, res) => {
    const rows = query('SELECT * FROM sqlite_master WHERE type = ?', ['table'])
    res.json(rows)
}

const test2 = (req, res) => {
    // execute('INSERT INTO user_saved_recipesTags (saved_recipeID, tagID) VALUES (69, 4)', [])
    // const rows = query('SELECT * FROM user_saved_recipesTags JOIN user_tags ON user_tags.tagID = user_saved_recipesTags.tagID JOIN user_saved_recipes ON user_saved_recipes.saved_recipeID = user_saved_recipesTags.saved_recipeID WHERE recipeID = ?', [15551])
    const results = updateShoppingList({meal_planID:12, userID:1})
    res.json(results)
}

module.exports = { testingFunction, test2, rows }