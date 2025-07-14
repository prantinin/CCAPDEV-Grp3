const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/viewprofile/:idNum', userController.getViewProfileStudent);

router.get('/profile/:email', userController.getViewProfileTech);

router.get('/editprofile/:idNum', userController.getEditProfile);
router.get('/editprofile/:idNum', userController.postEditProfile);

router.get('/searchusers', userController.getSearchUsers);
router.get('/searchusers', userController.postSearchUsers);

module.exports = router;