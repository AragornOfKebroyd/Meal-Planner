const { execute } = require('../controllers/databaseController')

const testadd = (req, res) => {
    const result = execute('INSERT INTO user_saved_recipes (userID, recipeID) VALUES (?, ?)', [1, 20])
    console.log(result)
    res.json({"result": result})
}

module.exports = testadd