const express = require('express')
const router = express.Router()
const { getRecipeController, 
    devDeleteRecipe,
    searchRecipesController,
    getSuggestedRecipesController,
    getRecipesFromIngredientsController,
    getIngredientsController,
    getWesbitesController,
    getCuisinesController,
    getCategoriesController } = require('../controllers/recipeController')

const { updateUserRecipeController, 
    addUserRecipeController, 
    getUserRecipesController, 
    createRecipeCopyController, 
    getUserSavedRecipesController,
    saveRecipeController,
    updateSavedRecipeController,
    unsaveRecipeController,
    setRecipeTagsController,
    deleteUserRecipeController } = require('../controllers/userRecipeController')

// Recipe Data
router.route('/data/ingredients')
    .post(getIngredientsController)

router.route('/data/websites')
    .post(getWesbitesController)

router.route('/data/cuisines')
    .post(getCuisinesController)

router.route('/data/categories')
    .post(getCategoriesController)    

// Get Recipe Results
router.route('/search')
    .post(searchRecipesController)

router.route('/suggested')
    .get(getSuggestedRecipesController)

router.route('/fromingredients')
    .post(getRecipesFromIngredientsController)

// User recipes
router.route('/user/:userID/created')
    .get(getUserRecipesController)
    .post(addUserRecipeController)
    .patch(updateUserRecipeController)
    .delete(deleteUserRecipeController)

// Saved recipes
router.route('/user/:userID/saved/:IDsOnly')
    .get(getUserSavedRecipesController)
    
router.route('/user/:userID/saved')
    .post(saveRecipeController)
    .patch(updateSavedRecipeController)
    .delete(unsaveRecipeController)

// App Recipes
router.route('/:recipeID/:userID')
    .get(getRecipeController)
    .delete(devDeleteRecipe)

router.route('/:recipeID/tags')
    .post(setRecipeTagsController)

router.route('/:recipeID/copy')
    .post(createRecipeCopyController)    

module.exports = router