const express = require('express')
const router = express.Router()
const { createMealPlanController, 
    deleteMealPlanController,
    getUserMealPlansController,
    getMealPlanController,
    updateMealPlanController,
    getActiveUserMealPlanController,
    setActiveMealPlanController, 
    getShoppingListController,
    checkShoppingListItemsController} = require('../controllers/mealPlanController')

router.route('/user/:userID')
    .get(getUserMealPlansController)
    .post(createMealPlanController)
    
router.route('/user/:userID/active')
    .get(getActiveUserMealPlanController)
    .patch(setActiveMealPlanController)
    
router.route('/user/:userID/:meal_planID')
    .get(getMealPlanController)
    .patch(updateMealPlanController)
    .delete(deleteMealPlanController)

router.route('/user/:userID/:meal_planID/shoppinglist')
    .get(getShoppingListController)
    .patch(checkShoppingListItemsController)

module.exports = router