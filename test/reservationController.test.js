const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const mongoose = require('mongoose');
const Reservation = require('../models/Reservations');
const User = require('../models/Users');

chai.use(chaiHttp);
const expect = chai.expect;

describe('Reservation Controller', () => {
  let agent;

  before(async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017/labubuddiesDB');
    agent = chai.request.agent(app);

    await agent.post('/login').send({
      email: 'timothy_ortiz@dlsu.edu.ph',
      password: 'iLoveChikkieNuggies123'
    });
  });

  after(async () => {
    await mongoose.connection.close();
  });

  it('should create a reservation', done => {
    agent
      .post('/createreserve')
      .send({
        item: 'Projector',
        date: '2025-08-10',
        time: '10:00 AM',
        duration: 2
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
});
