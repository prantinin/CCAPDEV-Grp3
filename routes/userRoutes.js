const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/viewprofile/:idNum', userController.getViewProfileStudent);

router.get('/profile/:email', userController.getViewProfileTech);

router.get('/editprofile/:idNum', userController.getEditProfile);
router.post('/editprofile/:idNum', userController.uploadProfilePicture, userController.postEditProfile);

router.get('/searchusers', userController.getSearchUsers);
router.post('/searchusers', userController.postSearchUsers);

router.delete('/deleteaccount/:idNum', userController.deleteAccount);

module.exports = router;
