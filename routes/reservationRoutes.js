const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { isAuthenticated, isStudent, isTechnician } = require('../middleware/auth');

router.get('/createreserve', isAuthenticated, isStudent, reservationController.getCreateResStudent);
router.post('/submit-reservation', isAuthenticated, isStudent, reservationController.postResStudent);

router.get('/Tcreatereserve', isAuthenticated, isTechnician, reservationController.getCreateResTech);
router.post('/Tsubmit-reservation', isAuthenticated, isTechnician, reservationController.postResTech);

router.get('/viewreservs', isAuthenticated, isStudent, reservationController.getViewResStudent);

router.get('/tviewreservs', isAuthenticated, isTechnician, reservationController.getViewResTech);
router.get('/tfilterreservs', isAuthenticated, isTechnician, reservationController.getFilterResTech);

router.get('/editreserve/:id', isAuthenticated, reservationController.getEditRes);
router.post('/editreserve/:id', isAuthenticated, reservationController.postEditRes);

router.post('/deletereservation/:id', isAuthenticated, reservationController.deleteReservation);

module.exports = router;