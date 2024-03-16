const express = require('express')
const router = express.Router()
const { getUserDataController, 
    getAllUserDataController,
    updateUserDataController,
    deleteUserController,
    addTagController,
    removeTagController,
    getUserCupboardItems,
    updateUserCupboardItems } = require('../controllers/userController')

router.route('/all')
    .get(getAllUserDataController)

router.route('/:userID')
    .get(getUserDataController)
    // creating a user is part of the auth routes, register
    .patch(updateUserDataController)
    .delete(deleteUserController)

router.route('/tags/:userID')
    // get is in getUserDataController    
    .post(addTagController)
    .delete(removeTagController)

router.route('/cupboard/:userID')
    .get(getUserCupboardItems)
    .patch(updateUserCupboardItems)

module.exports = router