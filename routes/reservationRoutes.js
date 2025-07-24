const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');

router.get('/createreserve', reservationController.getCreateResStudent);
router.post('/submit-reservation', reservationController.postResStudent);

router.get('/Tcreatereserve', reservationController.getCreateResTech);
router.post('/Tsubmit-reservation', reservationController.postResTech);

router.get('/viewreservs', reservationController.getViewResStudent);

router.get('/tviewreservs', reservationController.getViewResTech);
router.get('/tfilterreservs', reservationController.getFilterResTech);

router.post('/deletereservation/:id', reservationController.deleteReservation);

module.exports = router;