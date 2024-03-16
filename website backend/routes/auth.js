const express = require('express')
const router = express.Router()
const { loginController, registerController, logoutController, changePasswordController } = require('../controllers/authController')

router.route('/register')
    .post(registerController)

router.route('/login')
    .post(loginController)

router.route('/logout')
    .post(logoutController)

router.route('/changepassword')
    .post(changePasswordController)

router.route('/refresh')
//     .post()


module.exports = router