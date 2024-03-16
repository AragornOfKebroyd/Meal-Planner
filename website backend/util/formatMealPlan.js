const { queryOne } = require('../controllers/databaseController')

const formatMealPlan = (meal_plan) => {
  const days = ['monday', 'tuesday', 'wednesday', 'thurday', 'friday', 'saturday', 'sunday'].map(item => {
    const day = {
      'breakfast': meal_plan[item+'_breakfast'] ? queryOne('SELECT * FROM recipe WHERE recipeID = ?', [meal_plan[item+'_breakfast']]) : null,
      'lunch': meal_plan[item+'_lunch'] ? queryOne('SELECT * FROM recipe WHERE recipeID = ?', [meal_plan[item+'_lunch']]) : null,
      'dinner': meal_plan[item+'_dinner'] ? queryOne('SELECT * FROM recipe WHERE recipeID = ?', [meal_plan[item+'_dinner']]) : null
    }
    return day
  })

  return { [meal_plan.meal_planID]: days }
}

module.exports = { formatMealPlan }