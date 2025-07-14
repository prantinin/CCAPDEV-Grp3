const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');

router.get('/createreserve', reservationController.getCreateResStudent);
router.get('/submit-reservation', reservationController.postResStudent);

router.get('/Tcreatereserve', reservationController.getCreateResTech);
router.get('/Tsubmit-reservation', reservationController.postResTech);

router.get('/viewreservs', reservationController.getViewResStudent);

router.get('/tviewreservs', reservationController.getViewResTech);
router.get('/tfilterreservs', reservationController.getFilterResTech);

router.get('/deletereservation/:id', reservationController.postDeleteRes);

module.exports = router;